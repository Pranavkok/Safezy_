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

async function generateReportNo(
  supabase: Awaited<ReturnType<typeof createClient>>,
  observationType: ObservationType
): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const prefix = getReportPrefix(observationType);

  const monthStart = `${year}-${month}-01T00:00:00.000Z`;
  const nextMonth = now.getMonth() === 11 ? `${year + 1}-01-01T00:00:00.000Z` : `${year}-${(now.getMonth() + 2).toString().padStart(2, '0')}-01T00:00:00.000Z`;

  const { count } = await supabase
    .from('ehs_ua_uc_near_miss')
    .select('*', { count: 'exact', head: true })
    .eq('observation_type', observationType)
    .gte('reported_at', monthStart)
    .lt('reported_at', nextMonth);

  const sequence = ((count ?? 0) + 1).toString().padStart(4, '0');
  return `${prefix}-${year}-${month}-${sequence}`;
}

// ─── submitUaUcReport ─────────────────────────────────────────────────────────

// mediaUrl and mediaType are passed in from the client after upload (same pattern
// as savePage1 in incident-analysis.ts — client uploads first, then passes URL)
export const submitUaUcReport = async (
  formData: Omit<UaUcNearMissFormType, 'media' | 'media_type'>,
  mediaUrl: string | null,
  mediaType: MediaType | null
): Promise<{ success: boolean; message: string; data?: { id: number; report_no: string } }> => {
  const supabase = await createClient();

  try {
    // 1. Auth
    const authId = await getAuthId();
    if (!authId) {
      return { success: false, message: 'You must be logged in to submit a report' };
    }

    // 2. Get user profile snapshot
    const { data: userProfile } = await supabase
      .from('users')
      .select('id, first_name, last_name, user_unique_code')
      .eq('auth_id', authId)
      .single();

    const reportedByName = userProfile
      ? `${userProfile.first_name} ${userProfile.last_name}`.trim()
      : '';
    const employeeId = userProfile?.user_unique_code ?? '';

    // 3. Generate report number
    const reportNo = await generateReportNo(supabase, formData.observation_type);

    // 5. Insert row
    const { data: inserted, error } = await supabase
      .from('ehs_ua_uc_near_miss')
      .insert({
        report_no:            reportNo,
        observation_type:     formData.observation_type,
        location_department:  formData.location_department,
        reported_by_user_id:  authId,
        reported_by_name:     reportedByName,
        employee_id:          employeeId,
        what_happened:        formData.what_happened ?? null,
        equipment_involved:   formData.equipment_involved ?? null,
        activity_at_time:     formData.activity_at_time ?? null,
        media_url:            mediaUrl,
        media_type:           mediaType,
        ua_classifications:   formData.ua_classifications ?? [],
        ua_other:             formData.ua_other ?? null,
        uc_classifications:    formData.uc_classifications ?? [],
        uc_other:              formData.uc_other ?? null,
        uc_severity:           formData.uc_severity ?? null,
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

    if (error || !inserted) {
      console.error('[submitUaUcReport] insert error:', error);
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

    const { data, error } = await supabase
      .from('ehs_ua_uc_near_miss')
      .select('id, report_no, observation_type, status, reported_at, location_department')
      .eq('reported_by_user_id', authId)
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
