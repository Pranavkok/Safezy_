'use server';

import { createClient } from '@/utils/supabase/server';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/constants';
import {
  ComplaintListingType,
  GetComplaintsParamsType
} from '@/types/complaint.types';

// Get all complaints (submitted via the public complaint form → contact table)
export const getComplaints = async ({
  searchQuery,
  sortBy,
  sortOrder = 'asc',
  page = 1,
  pageSize = 10
}: GetComplaintsParamsType): Promise<{
  success: boolean;
  message: string;
  data?: ComplaintListingType[];
  pageCount?: number;
}> => {
  const supabase = await createClient();
  try {
    let query = supabase
      .from('contact')
      .select('id, first_name, last_name, email, company_name, contact_number, requirements', { count: 'exact' })
      .ilike('requirements', '[COMPLAINT]%');

    if (searchQuery) {
      query = query.or(
        `first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,company_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`
      );
    }

    if (sortBy && ['first_name', 'company_name', 'email'].includes(sortBy)) {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching complaints:', error);
      return {
        success: false,
        message: ERROR_MESSAGES.COMPLAINT_NOT_FETCHED
      };
    }

    const complaintsData: ComplaintListingType[] = data.map(row => ({
      id: row.id,
      image: null,
      description: row.requirements.replace(/^\[COMPLAINT\]\s*/, ''),
      first_name: row.first_name,
      last_name: row.last_name,
      company_name: row.company_name,
      email: row.email,
      contact_number: row.contact_number ?? '',
      order_id: null
    }));

    return {
      success: true,
      message: SUCCESS_MESSAGES.COMPLAINT_FETCHED,
      data: complaintsData,
      pageCount: count ? Math.ceil(count / pageSize) : 1
    };
  } catch (err) {
    console.error('Error fetching complaints:', err.message);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};
