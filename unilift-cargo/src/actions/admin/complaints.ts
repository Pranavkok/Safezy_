'use server';

import { createClient } from '@/utils/supabase/server';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/constants';
import {
  ComplaintListingType,
  GetComplaintsParamsType
} from '@/types/complaint.types';

// Get all complaints
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
    let complaintQuery = supabase.from('complaint').select(
      `
          id,
          image,
          description,
          order_id,
          users (
              first_name,
              last_name,
              company_name,
              email,
              contact_number
          )
      `,
      { count: 'exact' }
    );

    if (searchQuery) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .or(
          `first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,company_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`
        );

      if (userError) {
        console.error('Error fetching users for search criteria:', userError);
      } else {
        const userIds = userData.map(user => user.id);
        complaintQuery = complaintQuery.in('user_id', userIds);
      }
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    complaintQuery = complaintQuery.range(from, to);

    const { data, error, count } = await complaintQuery;

    if (error) {
      console.error('Error fetching complaints:', error);
      return {
        success: false,
        message: ERROR_MESSAGES.COMPLAINT_NOT_FETCHED
      };
    }

    const complaintsData = data.map(complaint => {
      return {
        id: complaint.id,
        image: complaint.image,
        description: complaint.description,
        first_name: complaint.users?.first_name,
        last_name: complaint.users?.last_name,
        company_name: complaint.users?.company_name,
        email: complaint.users!.email,
        contact_number: complaint.users!.contact_number,
        order_id: complaint.order_id
      };
    });

    if (sortBy && ['first_name', 'company_name', 'email'].includes(sortBy)) {
      complaintsData.sort((a, b) => {
        const fieldA = String(a[sortBy as keyof typeof a] || '');
        const fieldB = String(b[sortBy as keyof typeof b] || '');
        return sortOrder === 'asc'
          ? fieldA.localeCompare(fieldB)
          : fieldB.localeCompare(fieldA);
      });
    }

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
