'use server';

import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/constants';
import { ContractorType } from '@/types/index.types';
import { createClient } from '@/utils/supabase/server';

// [#] Fetch contractor by their id (Admin)
export const fetchContractorById = async (
  contractorId: string
): Promise<{ success: boolean; message: string; data?: ContractorType }> => {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
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
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.rpc('fetch_contractors', {
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
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.rpc('fetch_all_contractors');

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
