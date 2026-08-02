'use server';

import { createServiceClient } from '@/utils/supabase/service';
import { ERROR_MESSAGES } from '@/constants/constants';
import { revalidatePath } from 'next/cache';
import { AppRoutes } from '@/constants/AppRoutes';

// ─── UA / UC / Near Miss ──────────────────────────────────────────────────────

export const adminAssignUaUcReport = async (
  reportId: number,
  safetyOfficerUserId: string,
  safetyOfficerName: string
): Promise<{ success: boolean; message: string }> => {
  const supabase = createServiceClient();

  try {
    const { error } = await supabase
      .from('ehs_ua_uc_near_miss')
      .update({
        assigned_to_user_id: safetyOfficerUserId,
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
    revalidatePath(AppRoutes.ADMIN_EHS_UA_UC_NEAR_MISS_DETAILS(reportId.toString()));

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
        final_approval: 'Pending',
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId);

    if (error) {
      console.error('Error closing report:', error);
      return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
    }

    revalidatePath(AppRoutes.ADMIN_EHS_UA_UC_NEAR_MISS_LISTING);
    revalidatePath(AppRoutes.ADMIN_EHS_UA_UC_NEAR_MISS_DETAILS(reportId.toString()));

    return { success: true, message: 'Report closed successfully.' };
  } catch (err) {
    console.error('Unexpected error closing report:', err);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};

// ─── Incident Analysis ────────────────────────────────────────────────────────

export const adminAssignIncidentReport = async (
  reportId: number,
  safetyOfficerUserId: string,
  safetyOfficerName: string
): Promise<{ success: boolean; message: string }> => {
  const supabase = createServiceClient();

  try {
    const { error } = await supabase
      .from('ehs_incident_analysis')
      .update({
        assigned_to_user_id: safetyOfficerUserId,
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

// ─── UA / UC / Near Miss Final Approval ──────────────────────────────────────

export const approveUaUcReport = async (
  reportId: number,
  remarks?: string
): Promise<{ success: boolean; message: string }> => {
  const supabase = createServiceClient();
  try {
    const { error } = await supabase
      .from('ehs_ua_uc_near_miss')
      .update({
        final_approval: 'Approved',
        final_approval_remarks: remarks ?? null,
        final_approval_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId);

    if (error) {
      console.error('Error approving UA/UC report:', error);
      return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
    }

    revalidatePath(AppRoutes.ADMIN_EHS_UA_UC_NEAR_MISS_LISTING);
    revalidatePath(AppRoutes.ADMIN_EHS_UA_UC_NEAR_MISS_DETAILS(reportId.toString()));

    return { success: true, message: 'Report approved successfully.' };
  } catch (err) {
    console.error('Unexpected error approving UA/UC report:', err);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};

export const rejectUaUcReport = async (
  reportId: number,
  remarks: string
): Promise<{ success: boolean; message: string }> => {
  const supabase = createServiceClient();
  try {
    const { data: report } = await supabase
      .from('ehs_ua_uc_near_miss')
      .select('assigned_to_user_id, report_no')
      .eq('id', reportId)
      .single();

    const { error } = await supabase
      .from('ehs_ua_uc_near_miss')
      .update({
        status: 'Assigned',
        final_approval: 'Rejected',
        final_approval_remarks: remarks,
        final_approval_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId);

    if (error) {
      console.error('Error rejecting UA/UC report:', error);
      return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
    }

    if (report?.assigned_to_user_id) {
      const { data: assignedOfficer } = await supabase
        .from('users')
        .select('auth_id')
        .eq('id', report.assigned_to_user_id)
        .maybeSingle();

      if (!assignedOfficer?.auth_id) {
        console.error('Could not resolve assigned Safety Officer Auth ID for UA/UC rejection notification.');
      } else {
        await supabase.from('notifications').insert({
          user_id: assignedOfficer.auth_id,
          type: 'uauc_rejected_by_admin',
          title: 'UA/UC Closure Rejected',
          body: `Your closure of report "${report.report_no}" was rejected. Reason: ${remarks}`,
          is_read: false
        });
      }
    }

    revalidatePath(AppRoutes.ADMIN_EHS_UA_UC_NEAR_MISS_LISTING);
    revalidatePath(AppRoutes.ADMIN_EHS_UA_UC_NEAR_MISS_DETAILS(reportId.toString()));

    return { success: true, message: 'Report rejected and safety officer notified.' };
  } catch (err) {
    console.error('Unexpected error rejecting UA/UC report:', err);
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
      const { data: assignedOfficer } = await supabase
        .from('users')
        .select('auth_id')
        .eq('id', incident.assigned_to_user_id)
        .maybeSingle();

      if (!assignedOfficer?.auth_id) {
        console.error('Could not resolve assigned Safety Officer Auth ID for incident rejection notification.');
      } else {
        await supabase.from('notifications').insert({
          user_id: assignedOfficer.auth_id,
          type: 'incident_rejected_by_admin',
          title: 'Incident Closure Rejected',
          body: `Your closure of incident "${incident.title}" was rejected. Reason: ${remarks}`,
          is_read: false
        });
      }
    }

    revalidatePath(AppRoutes.ADMIN_EHS_INCIDENT_ANALYSIS_LISTING);
    revalidatePath(AppRoutes.ADMIN_EHS_INCIDENT_ANALYSIS_DETAILS(reportId));

    return { success: true, message: 'Incident rejected and safety officer notified.' };
  } catch (err) {
    console.error('Unexpected error rejecting incident:', err);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};
