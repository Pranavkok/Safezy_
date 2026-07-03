'use server';

import { ERROR_MESSAGES } from '@/constants/constants';
import {
  MediaType,
  ObservationStatus,
  ObservationType,
  UaUcNearMissFormType,
  UaUcNearMissListItem,
  UaUcNearMissRecord
} from '@/types/ehs.types';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { getAuthId } from '../user';

const REVALIDATE_PATH = '/contractor/ehs/ua-uc-near-miss';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getReportPrefix(type: ObservationType): string {
  if (type === 'UA') return 'UA';
  if (type === 'UC') return 'UC';
  return 'NM';
}

/**
 * Build a candidate report number for the given sequence index (1-based).
 * Does NOT hit the database — callers manage the sequence themselves.
 */
function buildReportNo(
  observationType: ObservationType,
  year: number,
  month: string,
  sequence: number
): string {
  const prefix = getReportPrefix(observationType);
  return `${prefix}-${year}-${month}-${sequence.toString().padStart(4, '0')}`;
}

/**
 * Count how many reports of this type already exist this calendar month
 * so we can pick the first candidate sequence number.
 */
async function getMonthlyCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  observationType: ObservationType,
  year: number,
  month: string
): Promise<number> {
  const monthStart = `${year}-${month}-01T00:00:00.000Z`;
  const monthNum = parseInt(month, 10);
  const nextMonth =
    monthNum === 12
      ? `${year + 1}-01-01T00:00:00.000Z`
      : `${year}-${(monthNum + 1).toString().padStart(2, '0')}-01T00:00:00.000Z`;

  const { count } = await supabase
    .from('ehs_ua_uc_near_miss')
    .select('*', { count: 'exact', head: true })
    .eq('observation_type', observationType)
    .gte('reported_at', monthStart)
    .lt('reported_at', nextMonth);

  return count ?? 0;
}

// ─── submitUaUcReport ─────────────────────────────────────────────────────────

// mediaUrl and mediaType are passed in from the client after upload (same pattern
// as savePage1 in incident-analysis.ts — client uploads first, then passes URL)
export const submitUaUcReport = async (
  formData: Omit<UaUcNearMissFormType, 'media' | 'media_type'>,
  mediaUrls: string[],
  mediaTypes: MediaType[]
): Promise<{ success: boolean; message: string; data?: { id: number; report_no: string } }> => {
  const supabase = await createClient();

  try {
    // 1. Auth
    const authId = await getAuthId();
    if (!authId) {
      return { success: false, message: 'You must be logged in to submit a report' };
    }

    // 2. Get user profile snapshot
    // IMPORTANT: reported_by_user_id FK references users.id (app UUID), NOT authId (auth UUID).
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, first_name, last_name, user_unique_code')
      .eq('auth_id', authId)
      .single();

    if (profileError || !userProfile) {
      console.error('[submitUaUcReport] user profile not found for authId:', authId, profileError);
      return { success: false, message: 'User profile not found. Please contact support.' };
    }

    const reportedByName = `${userProfile.first_name} ${userProfile.last_name}`.trim();
    const employeeId = userProfile.user_unique_code ?? '';
    // users.id is the app-level UUID that the FK constraint points to
    const appUserId = userProfile.id;

    // 3. Determine starting sequence from current month count
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const monthlyCount = await getMonthlyCount(supabase, formData.observation_type, year, month);

    // 4. Insert with retry loop to handle concurrent duplicate report_no collisions (HTTP 409 / PG 23505)
    const MAX_RETRIES = 5;
    let inserted: { id: number; report_no: string } | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const reportNo = buildReportNo(formData.observation_type, year, month, monthlyCount + 1 + attempt);

      const { data, error } = await supabase
        .from('ehs_ua_uc_near_miss')
        .insert({
          report_no:            reportNo,
          observation_type:     formData.observation_type,
          location_department:  formData.location_department,
          reported_by_user_id:  appUserId,   // users.id — the FK target
          reported_by_name:     reportedByName,
          employee_id:          employeeId,
          what_happened:        formData.what_happened ?? null,
          equipment_involved:   formData.equipment_involved ?? null,
          activity_at_time:     formData.activity_at_time ?? null,
          media_url:            mediaUrls[0] ?? null,
          media_type:           mediaTypes[0] ?? null,
          media_urls:           mediaUrls,
          media_types:          mediaTypes,
          ua_classifications:   formData.ua_classifications ?? [],
          ua_other:             formData.ua_other ?? null,
          uc_classifications:   formData.uc_classifications ?? [],
          uc_other:             formData.uc_other ?? null,
          uc_severity:          formData.uc_severity ?? null,
          uc_temporary_controls: formData.uc_temporary_controls ?? null,
          nm_potential_injury:  formData.nm_potential_injury ?? null,
          nm_what_could_happen: formData.nm_what_could_happen ?? null,
          nm_severity:          formData.nm_severity ?? null,
          status:               formData.status,
          action_taken:         formData.action_taken ?? null,
          action_by:            formData.action_by ?? null,
          action_date:          formData.action_date ?? null,
          updated_at:           new Date().toISOString()
        })
        .select('id, report_no')
        .single();

      if (data) {
        inserted = data;
        break;
      }

      // 23505 = unique_violation — the report_no was taken by a concurrent insert; retry with next sequence.
      // Any other error is unexpected — bail out immediately.
      const pgCode = (error as { code?: string } | null)?.code;
      if (pgCode !== '23505') {
        console.error('[submitUaUcReport] insert error:', error);
        return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
      }

      console.warn(`[submitUaUcReport] report_no collision on attempt ${attempt + 1}, retrying…`);
    }

    if (!inserted) {
      console.error('[submitUaUcReport] exhausted retries — could not generate a unique report_no');
      return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
    }

    revalidatePath(REVALIDATE_PATH);

    return {
      success: true,
      message: 'Report submitted successfully',
      data: { id: inserted.id, report_no: inserted.report_no }
    };
  } catch (error) {
    console.error('[submitUaUcReport] unexpected error:', error);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};

// ─── updateReportStatus ───────────────────────────────────────────────────────

export const updateReportStatus = async (
  id: number,
  status: ObservationStatus,
  closeData?: { action_taken: string; action_by: string; action_date: string }
): Promise<{ success: boolean; message: string }> => {
  const supabase = await createClient();

  try {
    const payload: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === 'Closed' && closeData) {
      payload.action_taken = closeData.action_taken;
      payload.action_by    = closeData.action_by;
      payload.action_date  = closeData.action_date;
    }

    const { error } = await supabase
      .from('ehs_ua_uc_near_miss')
      .update(payload)
      .eq('id', id);

    if (error) {
      console.error('[updateReportStatus] error:', error);
      return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
    }

    revalidatePath(REVALIDATE_PATH);

    return { success: true, message: `Report marked as ${status}` };
  } catch (error) {
    console.error('[updateReportStatus] unexpected error:', error);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};

// ─── getUaUcReportById ────────────────────────────────────────────────────────

export const getUaUcReportById = async (
  id: number
): Promise<{ success: boolean; message: string; data?: UaUcNearMissRecord }> => {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('ehs_ua_uc_near_miss')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('[getUaUcReportById] error:', error);
      return { success: false, message: 'Report not found' };
    }

    return {
      success: true,
      message: 'Report fetched successfully',
      data: data as UaUcNearMissRecord
    };
  } catch (error) {
    console.error('[getUaUcReportById] unexpected error:', error);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};

// ─── updateUaUcReportFull ─────────────────────────────────────────────────────

export const updateUaUcReportFull = async (
  id: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>
): Promise<{ success: boolean; message: string }> => {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from('ehs_ua_uc_near_miss')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('[updateUaUcReportFull] error:', error);
      return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
    }

    revalidatePath(REVALIDATE_PATH);
    return { success: true, message: 'Report updated successfully' };
  } catch (error) {
    console.error('[updateUaUcReportFull] unexpected error:', error);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};

// ─── getUaUcReportsList ───────────────────────────────────────────────────────

export const getUaUcReportsList = async (): Promise<{
  success: boolean;
  message: string;
  data?: UaUcNearMissListItem[];
}> => {
  const supabase = await createClient();

  try {
    const authId = await getAuthId();
    if (!authId) {
      return { success: false, message: 'You must be logged in to view reports' };
    }

    // Resolve app-level user ID (users.id) since reported_by_user_id stores users.id, not auth UUID
    const { data: userProfile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', authId)
      .single();

    if (!userProfile) {
      return { success: false, message: 'User profile not found.' };
    }

    const { data, error } = await supabase
      .from('ehs_ua_uc_near_miss')
      .select('id, report_no, observation_type, status, reported_at, location_department')
      .eq('reported_by_user_id', userProfile.id)
      .order('reported_at', { ascending: false });

    if (error) {
      console.error('[getUaUcReportsList] error:', error);
      return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
    }

    return {
      success: true,
      message: 'Reports fetched successfully',
      data: (data ?? []) as UaUcNearMissListItem[]
    };
  } catch (error) {
    console.error('[getUaUcReportsList] unexpected error:', error);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};

// ─── generateAndSaveUaUcCapa ──────────────────────────────────────────────────
// Calls the AI CAPA endpoint and saves the result back to the report row.
// This is a fire-and-forward action — report submission is NEVER blocked by
// CAPA generation failures.

export const generateAndSaveUaUcCapa = async (
  reportId: number,
  reportData: Record<string, unknown>
): Promise<{ success: boolean }> => {
  const supabase = await createClient();

  try {
    // Determine the base URL for internal API call
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    const res = await fetch(`${baseUrl}/api/generate-ua-uc-capa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData)
    });

    if (!res.ok) {
      console.warn('[generateAndSaveUaUcCapa] API returned non-OK status:', res.status);
      return { success: false };
    }

    const json: {
      success: boolean;
      data?: { corrective: string[]; preventive: string[] };
    } = await res.json();

    if (!json.success || !json.data) {
      console.warn('[generateAndSaveUaUcCapa] AI generation failed:', json);
      return { success: false };
    }

    const { error } = await supabase
      .from('ehs_ua_uc_near_miss')
      .update({
        capa_points: json.data,
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId);

    if (error) {
      console.error('[generateAndSaveUaUcCapa] DB update error:', error);
      return { success: false };
    }

    revalidatePath(REVALIDATE_PATH);
    return { success: true };
  } catch (error) {
    console.error('[generateAndSaveUaUcCapa] unexpected error:', error);
    return { success: false };
  }
};

