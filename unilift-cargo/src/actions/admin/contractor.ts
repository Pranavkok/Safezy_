'use server';

import { ERROR_MESSAGES, SUCCESS_MESSAGES, USER_ROLES } from '@/constants/constants';
import { ContractorType } from '@/types/index.types';
import { createServiceClient } from '@/utils/supabase/service';
import { revalidatePath } from 'next/cache';
import { AppRoutes } from '@/constants/AppRoutes';
import { generateRandomNumber } from '@/actions/helper';

export type CreateContractorInput = {
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  contactNumber: string;
  password: string;
};

export const createContractorByAdmin = async (
  input: CreateContractorInput
): Promise<{ success: boolean; message: string }> => {
  const serviceClient = createServiceClient();

  try {
    // Check for existing user
    const { data: existingUser } = await serviceClient
      .from('users')
      .select('email')
      .eq('email', input.email.trim())
      .single();

    if (existingUser) {
      return { success: false, message: 'A customer with this email already exists.' };
    }

    // Create auth user (email confirmed immediately, no verification email flow)
    const { data: authData, error: authError } = await serviceClient.auth.admin.createUser({
      email: input.email.trim(),
      password: input.password,
      email_confirm: true
    });

    if (authError || !authData.user) {
      console.error('Error creating auth user:', authError);
      return { success: false, message: authError?.message ?? ERROR_MESSAGES.UNEXPECTED_ERROR };
    }

    const authId = authData.user.id;

    // Fetch contractor role id
    const { data: roleData, error: roleError } = await serviceClient
      .from('user_roles')
      .select('id')
      .eq('role', USER_ROLES.CONTRACTOR)
      .single();

    if (roleError || !roleData) {
      await serviceClient.auth.admin.deleteUser(authId);
      return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
    }

    // Generate unique user code
    const generateCode = (): string => {
      const a = input.firstName.charAt(0).toLowerCase();
      const b = input.lastName.charAt(0).toLowerCase();
      const c = input.contactNumber.slice(0, 2);
      const d = input.contactNumber.slice(-2);
      const e = input.companyName.slice(0, 4).toLowerCase();
      const r = generateRandomNumber();
      return `${a}${b}${c}-${d}${e}-${r}`;
    };

    let uniqueCode: string;
    let existing: unknown;
    do {
      uniqueCode = generateCode();
      const { data } = await serviceClient
        .from('users')
        .select('user_unique_code')
        .eq('user_unique_code', uniqueCode)
        .single();
      existing = data;
    } while (existing);

    const { error: insertError } = await serviceClient.from('users').insert({
      first_name: input.firstName.trim(),
      last_name: input.lastName.trim(),
      company_name: input.companyName.trim(),
      email: input.email.trim(),
      contact_number: input.contactNumber.trim(),
      auth_id: authId,
      role_id: roleData.id,
      user_unique_code: uniqueCode!
    });

    if (insertError) {
      await serviceClient.auth.admin.deleteUser(authId);
      console.error('Error inserting contractor:', insertError);
      return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
    }

    revalidatePath(AppRoutes.ADMIN_CONTRACTOR_LISTING);
    return { success: true, message: 'Customer created successfully.' };
  } catch (err) {
    console.error('Unexpected error creating contractor:', err);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};

// [#] Fetch contractor by their id (Admin)
export const fetchContractorById = async (
  contractorId: string
): Promise<{ success: boolean; message: string; data?: ContractorType }> => {
  const serviceClient = createServiceClient();

  try {
    const { data, error } = await serviceClient
      .from('users')
      .select('*')
      .eq('id', contractorId)
      .single();

    if (error) {
      console.error('Error fetching contractor details:', error);
      return { success: false, message: ERROR_MESSAGES.CONTRACTOR_NOT_FETCHED };
    }

    return {
      data,
      success: true,
      message: SUCCESS_MESSAGES.CONTRACTOR_DETAILS_FETCHED
    };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, message: ERROR_MESSAGES.CONTRACTOR_NOT_FETCHED };
  }
};

export type FetchContractorType = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  contact_number: string;
  is_active: boolean;
  total_orders: number;
  total_amount: number;
};

// Fetch All Contractors (Admin)
export const fetchContractors = async (
  searchQuery?: string,
  sortBy: string = 'first_name',
  sortOrder: string = 'asc',
  page: number = 1,
  pageSize: number = 10
): Promise<{
  success: boolean;
  message: string;
  data?: FetchContractorType[];
  pageCount?: number;
}> => {
  const serviceClient = createServiceClient();

  try {
    const { data, error } = await serviceClient.rpc('fetch_contractors', {
      search_query: searchQuery?.trim(),
      sort_by: sortBy,
      sort_order: sortOrder,
      page_number: page,
      page_size: pageSize
    });

    if (error) {
      console.error('Error fetching contractors:', error);
      return { success: false, message: ERROR_MESSAGES.CONTRACTOR_NOT_FETCHED };
    }

    if (!data || data.length === 0) {
      return {
        success: true,
        message: '',
        data: [],
        pageCount: 0
      };
    }

    const totalCount = data[0].total_count;

    return {
      success: true,
      message: SUCCESS_MESSAGES.CONTRACTOR_DETAILS_FETCHED,
      data: data,
      pageCount: Math.ceil(totalCount / pageSize)
    };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};

export type FetchAllContractorType = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  contact_number: string;
  company_name: string;
  total_orders: number;
  total_amount: number;
  total_worksite: number;
  total_workers: string;
};

// Fetch All Contractors Without Pagination (Admin)
export const fetchAllContractors = async (): Promise<{
  success: boolean;
  message: string;
  data?: FetchAllContractorType[];
}> => {
  const serviceClient = createServiceClient();

  try {
    const { data, error } = await serviceClient.rpc('fetch_all_contractors');

    if (error) {
      console.error('Error fetching all contractors:', error);
      return { success: false, message: ERROR_MESSAGES.CONTRACTOR_NOT_FETCHED };
    }

    if (!data || data.length === 0) {
      return {
        success: true,
        message: '',
        data: []
      };
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.CONTRACTOR_DETAILS_FETCHED,
      data: data
    };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};

export type UpdateContractorInput = {
  id: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
};

export const updateContractor = async (
  data: UpdateContractorInput
): Promise<{ success: boolean; message: string }> => {
  const serviceClient = createServiceClient();

  try {
    const { error } = await serviceClient
      .from('users')
      .update({
        first_name: data.firstName,
        last_name: data.lastName,
        contact_number: data.contactNumber
      })
      .eq('id', data.id);

    if (error) {
      console.error('Error updating contractor:', error);
      return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
    }

    revalidatePath(AppRoutes.ADMIN_CONTRACTOR_LISTING);
    return { success: true, message: 'Customer updated successfully.' };
  } catch (err) {
    console.error('Unexpected error updating contractor:', err);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};

// Finds and deletes any auth user with the given email, regardless of auth_id.
// Used as a safety net when the stored auth_id may be stale or null.
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

export const deleteContractor = async (
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

    // Delete from auth first so we can bail before touching the DB if it fails.
    // Use auth_id when available; always follow up with an email-based cleanup so
    // that stale / null auth_ids don't leave an orphaned Supabase auth record.
    if (userData.auth_id) {
      const { error: authError } = await serviceClient.auth.admin.deleteUser(
        userData.auth_id
      );

      // Treat "user not found" as success — auth row may have already been removed
      if (authError && !authError.message?.toLowerCase().includes('not found')) {
        console.error('Error deleting auth user:', authError);
        return { success: false, message: 'Failed to delete user. Please try again.' };
      }
    }

    // Email-based cleanup catches any auth record whose UUID differs from auth_id
    // (e.g., the user re-registered after a partial delete) so re-registration works.
    await cleanupAuthUserByEmail(userData.email);

    // --- Cascade-delete all FK-constrained child records ---
    // None of the FK constraints use ON DELETE CASCADE, so we must remove
    // child rows manually in dependency order before deleting the user row.

    // 1. Collect IDs needed for grandchild cleanup
    const [{ data: worksiteRows }, { data: orderRows }, { data: checklistUserRows }] =
      await Promise.all([
        serviceClient.from('worksite').select('id').eq('user_id', userId),
        serviceClient.from('order').select('id').eq('user_id', userId),
        serviceClient.from('ehs_checklist_users').select('id').eq('user_id', userId)
      ]);

    const worksiteIds = (worksiteRows ?? []).map((r) => r.id);
    const orderIds = (orderRows ?? []).map((r) => r.id);
    const checklistUserIds = (checklistUserRows ?? []).map((r) => r.id);

    // Employee IDs span both the user's own employee record and all employees
    // that belong to the user's worksites (needed to clean product_history).
    const employeeQueries = [
      serviceClient.from('employee').select('id').eq('user_id', userId)
    ];
    if (worksiteIds.length > 0) {
      employeeQueries.push(
        serviceClient.from('employee').select('id').in('worksite_id', worksiteIds)
      );
    }
    const employeeResults = await Promise.all(employeeQueries);
    const allEmployeeIds = employeeResults.flatMap((r) => (r.data ?? []).map((e) => e.id));
    const employeeIds = allEmployeeIds.filter((id, i, a) => a.indexOf(id) === i);

    // Order-item IDs (needed to clean product_inventory rows that reference them)
    let orderItemIds: number[] = [];
    if (orderIds.length > 0) {
      const { data: itemRows } = await serviceClient
        .from('order_items')
        .select('id')
        .in('order_id', orderIds);
      orderItemIds = (itemRows ?? []).map((r) => r.id);
    }

    // 2. Deepest grandchildren first
    await Promise.all([
      checklistUserIds.length > 0
        ? serviceClient.from('ehs_checklist_done_questions').delete().in('checklist_user_id', checklistUserIds)
        : Promise.resolve(),
      employeeIds.length > 0
        ? serviceClient.from('product_history').delete().in('employee_id', employeeIds)
        : Promise.resolve(),
      orderItemIds.length > 0
        ? serviceClient.from('product_inventory').delete().in('order_items_id', orderItemIds)
        : Promise.resolve()
    ]);

    // 3. Mid-level children
    await Promise.all([
      serviceClient.from('ehs_checklist_users').delete().eq('user_id', userId),
      serviceClient.from('product_rating').delete().eq('user_id', userId),
      serviceClient.from('complaint').delete().eq('user_id', userId),
      serviceClient.from('transaction').delete().eq('user_id', userId),
      orderIds.length > 0
        ? serviceClient.from('order_items').delete().in('order_id', orderIds)
        : Promise.resolve(),
      employeeIds.length > 0
        ? serviceClient.from('employee').delete().in('id', employeeIds)
        : Promise.resolve()
    ]);

    // 4. Null-out warehouse_operator_id on orders not owned by this user
    //    (those orders stay; we just remove the reference)
    await serviceClient
      .from('order')
      .update({ warehouse_operator_id: null })
      .eq('warehouse_operator_id', userId);

    // 5. Remaining direct children
    await Promise.all([
      serviceClient.from('ehs_toolbox_notes').delete().eq('user_id', userId),
      serviceClient.from('ehs_toolbox_users').delete().eq('user_id', userId),
      serviceClient.from('cart_items').delete().eq('user_id', userId),
      serviceClient.from('cart_reminder_tracking').delete().eq('user_id', userId),
      serviceClient.from('admin_ppe_assignments').delete().eq('contractor_id', userId),
      serviceClient.from('wishlist').delete().eq('user_id', userId),
      serviceClient.from('product_inventory').delete().eq('user_id', userId),
      serviceClient.from('address').delete().eq('user_id', userId),
      orderIds.length > 0
        ? serviceClient.from('order').delete().in('id', orderIds)
        : Promise.resolve()
    ]);

    // 6. Worksite children (address rows tied to worksites) then worksites
    if (worksiteIds.length > 0) {
      await serviceClient.from('address').delete().in('worksite_id', worksiteIds);
      await serviceClient.from('worksite').delete().in('id', worksiteIds);
    }

    // 7. Finally delete the user row
    const { error: dbError } = await serviceClient
      .from('users')
      .delete()
      .eq('id', userId);

    if (dbError) {
      console.error('Error deleting contractor from db:', dbError);
      return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
    }

    revalidatePath(AppRoutes.ADMIN_CONTRACTOR_LISTING);
    return { success: true, message: 'Customer deleted successfully.' };
  } catch (err) {
    console.error('Unexpected error deleting contractor:', err);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};
