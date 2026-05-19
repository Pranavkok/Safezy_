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
  closeData: { action_taken: string; action_by: string; action_date: string; closure_image_url?: string | null }
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
        closure_image_url: closeData.closure_image_url ?? null,
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
  closeData: { corrective_actions: string; preventive_actions: string; closure_image_url?: string | null }
): Promise<{ success: boolean; message: string }> => {
  const supabase = createServiceClient();

  try {
    const { error } = await supabase
      .from('ehs_incident_analysis')
      .update({
        is_completed: true,
        final_approval: 'Pending',
        corrective_actions: closeData.corrective_actions ? [closeData.corrective_actions] : [],
        preventive_actions: closeData.preventive_actions ? [closeData.preventive_actions] : [],
        closure_image_url: closeData.closure_image_url ?? null,
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

export const approveIncidentReport = async (
  reportId: number,
  remarks?: string
): Promise<{ success: boolean; message: string }> => {
  const supabase = createServiceClient();
  try {
    const { error } = await supabase
      .from('ehs_incident_analysis')
      .update({
        final_approval: 'Approved',
        final_approval_remarks: remarks ?? null,
        final_approval_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId);

    if (error) {
      console.error('Error approving incident:', error);
      return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
    }

    revalidatePath(AppRoutes.ADMIN_EHS_INCIDENT_ANALYSIS_LISTING);
    revalidatePath(AppRoutes.ADMIN_EHS_INCIDENT_ANALYSIS_DETAILS(reportId));

    return { success: true, message: 'Incident approved successfully.' };
  } catch (err) {
    console.error('Unexpected error approving incident:', err);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};

export const rejectIncidentReport = async (
  reportId: number,
  remarks: string
): Promise<{ success: boolean; message: string }> => {
  const supabase = createServiceClient();
  try {
    // Fetch assigned SO to notify them
    const { data: incident } = await supabase
      .from('ehs_incident_analysis')
      .select('assigned_to_user_id, title')
      .eq('id', reportId)
      .single();

    const { error } = await supabase
      .from('ehs_incident_analysis')
      .update({
        is_completed: false,
        final_approval: 'Rejected',
        final_approval_remarks: remarks,
        final_approval_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId);

    if (error) {
      console.error('Error rejecting incident:', error);
      return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
    }

    // Notify the assigned safety officer
    if (incident?.assigned_to_user_id) {
      await supabase.from('notifications').insert({
        user_id: incident.assigned_to_user_id,
        type: 'incident_rejected_by_admin',
        message: `Your closure of incident "${incident.title}" was rejected. Reason: ${remarks}`,
        is_read: false,
        created_at: new Date().toISOString()
      });
    }

    revalidatePath(AppRoutes.ADMIN_EHS_INCIDENT_ANALYSIS_LISTING);
    revalidatePath(AppRoutes.ADMIN_EHS_INCIDENT_ANALYSIS_DETAILS(reportId));

    return { success: true, message: 'Incident rejected and safety officer notified.' };
  } catch (err) {
    console.error('Unexpected error rejecting incident:', err);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};
