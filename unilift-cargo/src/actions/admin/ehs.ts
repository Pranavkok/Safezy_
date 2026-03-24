'use server';

import { createServiceClient } from '@/utils/supabase/service';
import { ERROR_MESSAGES } from '@/constants/constants';
import { revalidatePath } from 'next/cache';
import { AppRoutes } from '@/constants/AppRoutes';

// ─── UA / UC / Near Miss ──────────────────────────────────────────────────────

export const adminAssignUaUcReport = async (
  reportId: number,
  safetyOfficerId: string,
  safetyOfficerName: string
): Promise<{ success: boolean; message: string }> => {
  const supabase = createServiceClient();

  try {
    const { error } = await supabase
      .from('ehs_ua_uc_near_miss')
      .update({
        assigned_to_user_id: safetyOfficerId,
        assigned_to_name: safetyOfficerName,
        status: 'Assigned',
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId);

    if (error) {
      console.error('Error assigning report:', error);
      return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
    }

    revalidatePath(AppRoutes.ADMIN_EHS_UA_UC_NEAR_MISS_LISTING);

    return { success: true, message: 'Report assigned successfully.' };
  } catch (err) {
    console.error('Unexpected error assigning report:', err);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};

export const adminCloseUaUcReport = async (
  reportId: number,
  closeData: { action_taken: string; action_by: string; action_date: string }
): Promise<{ success: boolean; message: string }> => {
  const supabase = createServiceClient();

  try {
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

    revalidatePath(AppRoutes.ADMIN_EHS_UA_UC_NEAR_MISS_LISTING);

    return { success: true, message: 'Report closed successfully.' };
  } catch (err) {
    console.error('Unexpected error closing report:', err);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};

// ─── Incident Analysis ────────────────────────────────────────────────────────

export const adminAssignIncidentReport = async (
  reportId: number,
  safetyOfficerId: string,
  safetyOfficerName: string
): Promise<{ success: boolean; message: string }> => {
  const supabase = createServiceClient();

  try {
    const { error } = await supabase
      .from('ehs_incident_analysis')
      .update({
        assigned_to_user_id: safetyOfficerId,
        assigned_to_name: safetyOfficerName,
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId);

    if (error) {
      console.error('Error assigning incident:', error);
      return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
    }

    revalidatePath(AppRoutes.ADMIN_EHS_INCIDENT_ANALYSIS_LISTING);

    return { success: true, message: 'Incident assigned successfully.' };
  } catch (err) {
    console.error('Unexpected error assigning incident:', err);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};

export const adminCloseIncidentReport = async (
  reportId: number,
  closeData: { corrective_actions: string; preventive_actions: string }
): Promise<{ success: boolean; message: string }> => {
  const supabase = createServiceClient();

  try {
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

    revalidatePath(AppRoutes.ADMIN_EHS_INCIDENT_ANALYSIS_LISTING);

    return { success: true, message: 'Incident closed successfully.' };
  } catch (err) {
    console.error('Unexpected error closing incident:', err);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};
