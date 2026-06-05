'use server';

import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/constants';
import { ContractorType } from '@/types/index.types';
import { createServiceClient } from '@/utils/supabase/service';
import { revalidatePath } from 'next/cache';
import { AppRoutes } from '@/constants/AppRoutes';

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

    // Delete from auth first so we can bail before touching the DB if it fails
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
