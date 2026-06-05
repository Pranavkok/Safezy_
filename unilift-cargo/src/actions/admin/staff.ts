'use server';

import { createServiceClient } from '@/utils/supabase/service';
import { ERROR_MESSAGES, USER_ROLES } from '@/constants/constants';
import { revalidatePath } from 'next/cache';
import { AppRoutes } from '@/constants/AppRoutes';

export type StaffRole = 'manager' | 'safety_officer';

export type CreateStaffInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contactNumber: string;
  role: StaffRole;
};

export type StaffMember = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  contact_number: string;
  is_active: boolean | null;
  role: StaffRole;
  created_at: string;
};

// Admin creates a Manager or Safety Officer account using the service client
// so that the admin's own session is never affected.
export const createStaffUser = async (
  data: CreateStaffInput
): Promise<{ success: boolean; message: string }> => {
  const serviceClient = createServiceClient();

  try {
    // Check for existing user by email
    const { data: existingUser } = await serviceClient
      .from('users')
      .select('email')
      .eq('email', data.email)
      .maybeSingle();

    if (existingUser) {
      return { success: false, message: ERROR_MESSAGES.USER_ALREADY_REGISTERED };
    }

    // Create auth user via admin API — no OTP flow, no session side-effects
    const { data: authData, error: authError } =
      await serviceClient.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true, // mark email as already confirmed
        user_metadata: { user_role: data.role }
      });

    if (authError) {
      console.error('Error creating auth user for staff:', authError);
      return { success: false, message: authError.message };
    }

    const authId = authData.user?.id;
    if (!authId) {
      return { success: false, message: ERROR_MESSAGES.USER_ID_NOT_FOUND };
    }

    // Fetch the role ID from user_roles lookup table
    const { data: roleData, error: roleError } = await serviceClient
      .from('user_roles')
      .select('id')
      .eq('role', data.role)
      .single();

    if (roleError || !roleData) {
      console.error('Error fetching role:', roleError);
      return { success: false, message: ERROR_MESSAGES.ROLE_ERROR };
    }

    // Insert into users table
    const { error: insertError } = await serviceClient.from('users').insert({
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      contact_number: data.contactNumber,
      auth_id: authId,
      role_id: roleData.id
    });

    if (insertError) {
      console.error('Error inserting staff user:', insertError);
      return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
    }

    revalidatePath(AppRoutes.ADMIN_STAFF_LISTING);

    return {
      success: true,
      message: `${data.role === 'manager' ? 'Manager' : 'Safety Officer'} account created successfully.`
    };
  } catch (err) {
    console.error('Unexpected error creating staff user:', err);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};

// Fetch all staff members (managers + safety officers)
export const getStaffList = async (): Promise<{
  success: boolean;
  message: string;
  data?: StaffMember[];
}> => {
  const serviceClient = createServiceClient();

  try {
    const { data, error } = await serviceClient
      .from('users')
      .select('id, first_name, last_name, email, contact_number, is_active, created_at, user_roles!inner(role)')
      .in('user_roles.role', [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.SAFETY_OFFICER])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching staff list:', error);
      return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
    }

    const staffList: StaffMember[] = (data ?? []).map((u: any) => ({
      id: u.id,
      first_name: u.first_name,
      last_name: u.last_name,
      email: u.email,
      contact_number: u.contact_number,
      is_active: u.is_active,
      role: u.user_roles.role as StaffRole,
      created_at: u.created_at
    }));

    return { success: true, message: 'Staff list fetched successfully.', data: staffList };
  } catch (err) {
    console.error('Unexpected error fetching staff:', err);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};

export type UpdateStaffInput = {
  id: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  role: StaffRole;
};

export const updateStaffUser = async (
  data: UpdateStaffInput
): Promise<{ success: boolean; message: string }> => {
  const serviceClient = createServiceClient();

  try {
    const { data: roleData, error: roleError } = await serviceClient
      .from('user_roles')
      .select('id')
      .eq('role', data.role)
      .single();

    if (roleError || !roleData) {
      return { success: false, message: ERROR_MESSAGES.ROLE_ERROR };
    }

    const { error } = await serviceClient
      .from('users')
      .update({
        first_name: data.firstName,
        last_name: data.lastName,
        contact_number: data.contactNumber,
        role_id: roleData.id
      })
      .eq('id', data.id);

    if (error) {
      console.error('Error updating staff user:', error);
      return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
    }

    revalidatePath(AppRoutes.ADMIN_STAFF_LISTING);
    return { success: true, message: 'Staff member updated successfully.' };
  } catch (err) {
    console.error('Unexpected error updating staff user:', err);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};

async function cleanupAuthUserByEmail(email: string): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  try {
    const res = await fetch(
      `${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}&per_page=10`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
    );
    if (!res.ok) return;

    const body = await res.json();
    const authUsers: { id: string }[] = body.users ?? [];

    const serviceClient = createServiceClient();
    await Promise.all(
      authUsers.map((u) => serviceClient.auth.admin.deleteUser(u.id))
    );
  } catch (err) {
    console.error('cleanupAuthUserByEmail failed:', err);
  }
}

export const deleteStaffUser = async (
  userId: string
): Promise<{ success: boolean; message: string }> => {
  const serviceClient = createServiceClient();

  try {
    const { data: userData, error: fetchError } = await serviceClient
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError || !userData) {
      return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
    }

    const { error: dbError } = await serviceClient
      .from('users')
      .delete()
      .eq('id', userId);

    if (dbError) {
      console.error('Error deleting staff user from db:', dbError);
      return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
    }

    if (userData.auth_id) {
      const { error: authError } = await serviceClient.auth.admin.deleteUser(
        userData.auth_id
      );

      if (authError && !authError.message?.toLowerCase().includes('not found')) {
        console.error('Error deleting auth user:', authError);
        // Rollback — restore the deleted row so data stays consistent
        await serviceClient.from('users').insert(userData);
        return { success: false, message: 'Failed to delete user. Please try again.' };
      }
    }

    // Email-based cleanup so stale/null auth_ids don't leave an orphaned auth record
    await cleanupAuthUserByEmail(userData.email);

    revalidatePath(AppRoutes.ADMIN_STAFF_LISTING);
    return { success: true, message: 'Staff member deleted successfully.' };
  } catch (err) {
    console.error('Unexpected error deleting staff user:', err);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};

// Toggle active/inactive status for a staff member
export const toggleStaffStatus = async (
  userId: string,
  currentStatus: boolean
): Promise<{ success: boolean; message: string }> => {
  const serviceClient = createServiceClient();

  try {
    const { error } = await serviceClient
      .from('users')
      .update({ is_active: !currentStatus })
      .eq('id', userId);

    if (error) {
      console.error('Error toggling staff status:', error);
      return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
    }

    revalidatePath(AppRoutes.ADMIN_STAFF_LISTING);

    return {
      success: true,
      message: `User ${!currentStatus ? 'activated' : 'deactivated'} successfully.`
    };
  } catch (err) {
    console.error('Unexpected error toggling staff status:', err);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};
