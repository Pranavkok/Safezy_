'use server';

import { createServiceClient } from '@/utils/supabase/service';
import { ERROR_MESSAGES, USER_ROLES } from '@/constants/constants';
import { ObservationType, UaUcNearMissRecord } from '@/types/ehs.types';
import { revalidatePath } from 'next/cache';
import { AppRoutes } from '@/constants/AppRoutes';

// ─── UA / UC / Near Miss ──────────────────────────────────────────────────────

// Fetch ALL reports across the platform (not filtered by reporter)
export const getAllUaUcReports = async (filters?: {
  type?: ObservationType | 'All';
  status?: string;
}): Promise<{
  success: boolean;
  message: string;
  data?: UaUcNearMissRecord[];
}> => {
  const serviceClient = createServiceClient();

  try {
    let query = serviceClient
      .from('ehs_ua_uc_near_miss')
      .select('*')
      .order('reported_at', { ascending: false });

    if (filters?.type && filters.type !== 'All') {
      query = query.eq('observation_type', filters.type);
    }
    if (filters?.status && filters.status !== 'All') {
      query = query.eq('status', filters.status as 'Open' | 'Assigned' | 'Closed');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching UA/UC reports:', error);
      return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
    }

    return { success: true, message: 'Reports fetched successfully.', data: data ?? [] };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};

// Assign a UA/UC/Near Miss report to a Safety Officer
export const assignUaUcReport = async (
  reportId: number,
  safetyOfficerId: string,
  safetyOfficerName: string
): Promise<{ success: boolean; message: string }> => {
  const serviceClient = createServiceClient();

  try {
    const { error } = await serviceClient
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

    revalidatePath(AppRoutes.MANAGER_EHS_UA_UC_NEAR_MISS_LISTING);

    return { success: true, message: 'Report assigned successfully.' };
  } catch (err) {
    console.error('Unexpected error assigning report:', err);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};

// ─── Incident Analysis ────────────────────────────────────────────────────────

export type IncidentListItem = {
  id: number;
  title: string;
  incident_type: string | null;
  severity_level: string | null;
  location: string | null;
  date: string | null;
  created_at: string;
  is_completed: boolean | null;
  assigned_to_name: string | null;
  assigned_to_user_id: string | null;
};

// Fetch ALL incident analysis reports
export const getAllIncidentReports = async (filters?: {
  status?: 'Open' | 'Assigned' | 'Closed' | 'All';
}): Promise<{
  success: boolean;
  message: string;
  data?: IncidentListItem[];
}> => {
  const serviceClient = createServiceClient();

  try {
    let query = serviceClient
      .from('ehs_incident_analysis')
      .select('id, title, incident_type, severity_level, location, date, created_at, is_completed, assigned_to_name, assigned_to_user_id')
      .order('created_at', { ascending: false });

    if (filters?.status && filters.status !== 'All') {
      if (filters.status === 'Closed') {
        query = query.eq('is_completed', true);
      } else if (filters.status === 'Assigned') {
        query = query.eq('is_completed', false).not('assigned_to_user_id', 'is', null);
      } else {
        // Open: not completed and not assigned
        query = query.eq('is_completed', false).is('assigned_to_user_id', null);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching incident reports:', error);
      return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
    }

    return { success: true, message: 'Incidents fetched successfully.', data: data ?? [] };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};

// Assign an Incident Analysis report to a Safety Officer
export const assignIncidentReport = async (
  reportId: number,
  safetyOfficerId: string,
  safetyOfficerName: string
): Promise<{ success: boolean; message: string }> => {
  const serviceClient = createServiceClient();

  try {
    const { error } = await serviceClient
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

    revalidatePath(AppRoutes.MANAGER_EHS_INCIDENT_ANALYSIS_LISTING);

    return { success: true, message: 'Incident assigned successfully.' };
  } catch (err) {
    console.error('Unexpected error assigning incident:', err);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};

// ─── Shared Helpers ───────────────────────────────────────────────────────────

// Get dropdown list of all active Safety Officers (for the assign panel)
export const getSafetyOfficersList = async (): Promise<{
  success: boolean;
  data?: { authId: string; name: string }[];
}> => {
  const serviceClient = createServiceClient();

  try {
    const { data, error } = await serviceClient
      .from('users')
      .select('auth_id, first_name, last_name, user_roles!inner(role)')
      .eq('user_roles.role', USER_ROLES.SAFETY_OFFICER)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching safety officers:', error);
      return { success: false };
    }

    const officers = (data ?? []).map((u: any) => ({
      authId: u.auth_id,
      name: `${u.first_name} ${u.last_name}`
    }));

    return { success: true, data: officers };
  } catch (err) {
    console.error('Unexpected error fetching officers:', err);
    return { success: false };
  }
};

// Get summary stats for the manager dashboard
export const getManagerDashboardStats = async (): Promise<{
  success: boolean;
  data?: {
    uaUc: { open: number; assigned: number; closed: number };
    incidents: { open: number; assigned: number; closed: number };
  };
}> => {
  const serviceClient = createServiceClient();

  try {
    const [uaUcResult, incidentResult] = await Promise.all([
      serviceClient
        .from('ehs_ua_uc_near_miss')
        .select('status'),
      serviceClient
        .from('ehs_incident_analysis')
        .select('is_completed, assigned_to_user_id')
    ]);

    const uaUcData = uaUcResult.data ?? [];
    const incidentData = incidentResult.data ?? [];

    return {
      success: true,
      data: {
        uaUc: {
          open: uaUcData.filter((r: any) => r.status === 'Open').length,
          assigned: uaUcData.filter((r: any) => r.status === 'Assigned').length,
          closed: uaUcData.filter((r: any) => r.status === 'Closed').length
        },
        incidents: {
          open: incidentData.filter((r: any) => !r.is_completed && !r.assigned_to_user_id).length,
          assigned: incidentData.filter((r: any) => !r.is_completed && r.assigned_to_user_id).length,
          closed: incidentData.filter((r: any) => r.is_completed).length
        }
      }
    };
  } catch (err) {
    console.error('Unexpected error fetching dashboard stats:', err);
    return { success: false };
  }
};
