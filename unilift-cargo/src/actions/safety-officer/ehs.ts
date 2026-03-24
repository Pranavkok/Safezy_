'use server';

import { createClient } from '@/utils/supabase/server';
import { createServiceClient } from '@/utils/supabase/service';
import { ERROR_MESSAGES } from '@/constants/constants';
import { UaUcNearMissRecord } from '@/types/ehs.types';
import { revalidatePath } from 'next/cache';
import { AppRoutes } from '@/constants/AppRoutes';
import { getAuthId } from '@/actions/user';
import { IncidentListItem } from '@/actions/manager/ehs';

// ─── UA / UC / Near Miss ──────────────────────────────────────────────────────

// Get only the reports assigned to the currently logged-in safety officer
export const getMyAssignedUaUcReports = async (): Promise<{
  success: boolean;
  message: string;
  data?: UaUcNearMissRecord[];
}> => {
  const supabase = await createClient();

  try {
    const authId = await getAuthId();
    if (!authId) return { success: false, message: ERROR_MESSAGES.USER_NOT_FOUND };

    const { data, error } = await supabase
      .from('ehs_ua_uc_near_miss')
      .select('*')
      .eq('assigned_to_user_id', authId)
      .order('reported_at', { ascending: false });

    if (error) {
      console.error('Error fetching assigned reports:', error);
      return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
    }

    return { success: true, message: 'Reports fetched.', data: data ?? [] };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};

export type CloseUaUcInput = {
  action_taken: string;
  action_by: string;
  action_date: string;
};

// Safety officer closes a UA/UC/Near Miss report
export const closeUaUcReport = async (
  reportId: number,
  closeData: CloseUaUcInput
): Promise<{ success: boolean; message: string }> => {
  const supabase = createServiceClient();

  try {
    const authId = await getAuthId();
    if (!authId) return { success: false, message: ERROR_MESSAGES.USER_NOT_FOUND };

    // Verify this report is actually assigned to this safety officer
    const { data: existing } = await supabase
      .from('ehs_ua_uc_near_miss')
      .select('assigned_to_user_id')
      .eq('id', reportId)
      .single();

    if (!existing || existing.assigned_to_user_id !== authId) {
      return { success: false, message: 'You are not authorized to close this report.' };
    }

    const { error } = await supabase
      .from('ehs_ua_uc_near_miss')
      .update({
        status: 'Closed',
        action_taken: closeData.action_taken,
        action_by: closeData.action_by,
        action_date: closeData.action_date,
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId);

    if (error) {
      console.error('Error closing report:', error);
      return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
    }

    revalidatePath(AppRoutes.SAFETY_OFFICER_EHS_UA_UC_NEAR_MISS_LISTING);

    return { success: true, message: 'Report closed successfully.' };
  } catch (err) {
    console.error('Unexpected error closing report:', err);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};

// ─── Incident Analysis ────────────────────────────────────────────────────────

// Get only incidents assigned to this safety officer
export const getMyAssignedIncidents = async (): Promise<{
  success: boolean;
  message: string;
  data?: IncidentListItem[];
}> => {
  const supabase = await createClient();

  try {
    const authId = await getAuthId();
    if (!authId) return { success: false, message: ERROR_MESSAGES.USER_NOT_FOUND };

    const { data, error } = await supabase
      .from('ehs_incident_analysis')
      .select('id, title, location, date, is_completed, assigned_to_name, assigned_to_user_id')
      .eq('assigned_to_user_id', authId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching assigned incidents:', error);
      return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
    }

    return { success: true, message: 'Incidents fetched.', data: data ?? [] };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};

export type CloseIncidentInput = {
  corrective_actions: string;
  preventive_actions: string;
};

// Safety officer closes an incident analysis report
export const closeIncidentReport = async (
  reportId: number,
  closeData: CloseIncidentInput
): Promise<{ success: boolean; message: string }> => {
  const supabase = createServiceClient();

  try {
    const authId = await getAuthId();
    if (!authId) return { success: false, message: ERROR_MESSAGES.USER_NOT_FOUND };

    const { data: existing } = await supabase
      .from('ehs_incident_analysis')
      .select('assigned_to_user_id')
      .eq('id', reportId)
      .single();

    if (!existing || existing.assigned_to_user_id !== authId) {
      return { success: false, message: 'You are not authorized to close this incident.' };
    }

    const { error } = await supabase
      .from('ehs_incident_analysis')
      .update({
        is_completed: true,
        corrective_actions: closeData.corrective_actions ? [closeData.corrective_actions] : [],
        preventive_actions: closeData.preventive_actions ? [closeData.preventive_actions] : [],
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId);

    if (error) {
      console.error('Error closing incident:', error);
      return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
    }

    revalidatePath(AppRoutes.SAFETY_OFFICER_EHS_INCIDENT_ANALYSIS_LISTING);

    return { success: true, message: 'Incident closed successfully.' };
  } catch (err) {
    console.error('Unexpected error closing incident:', err);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};

// Dashboard stats for safety officer
export const getSafetyOfficerDashboardStats = async (): Promise<{
  success: boolean;
  data?: {
    uaUc: { assigned: number; closed: number };
    incidents: { assigned: number; closed: number };
  };
}> => {
  const supabase = await createClient();

  try {
    const authId = await getAuthId();
    if (!authId) return { success: false };

    const [uaUcResult, incidentResult] = await Promise.all([
      supabase
        .from('ehs_ua_uc_near_miss')
        .select('status')
        .eq('assigned_to_user_id', authId),
      supabase
        .from('ehs_incident_analysis')
        .select('is_completed')
        .eq('assigned_to_user_id', authId)
    ]);

    const uaUcData = uaUcResult.data ?? [];
    const incidentData = incidentResult.data ?? [];

    return {
      success: true,
      data: {
        uaUc: {
          assigned: uaUcData.filter((r: any) => r.status === 'Assigned').length,
          closed: uaUcData.filter((r: any) => r.status === 'Closed').length
        },
        incidents: {
          assigned: incidentData.filter((r: any) => !r.is_completed).length,
          closed: incidentData.filter((r: any) => r.is_completed).length
        }
      }
    };
  } catch (err) {
    console.error('Unexpected error fetching SO dashboard stats:', err);
    return { success: false };
  }
};
