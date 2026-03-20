'use server';

import { createClient } from '@/utils/supabase/server';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/constants';
import { addComplaintType, ComplaintModalType } from '@/types/complaint.types';
import { getUserIdFromAuth } from '../user';

// Add new complaint
export const addComplaint = async (
  complaintData: addComplaintType & { order_id: string }
) => {
  const supabase = await createClient();
  try {
    const { image, description, order_id } = complaintData;

    const userId = await getUserIdFromAuth();

    if (!userId) {
      return {
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND
      };
    }

    if (!image || !description) {
      return {
        success: false,
        message: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS
      };
    }

    const { data, error } = await supabase.from('complaint').insert({
      image: image,
      description: description,
      user_id: userId,
      order_id: order_id
    });

    if (error) {
      return {
        success: false,
        message: ERROR_MESSAGES.COMPLAINT_NOT_ADDED
      };
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.COMPLAINT_ADDED,
      data
    };
  } catch (err) {
    console.error('Error adding complaint:', err.message);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const addOrderInComplaint = async (orderId: string) => {
  const supabase = await createClient();

  try {
    const { error: updateOrderError } = await supabase
      .from('order')
      .update({ order_status: 'Complaint' })
      .eq('id', orderId);

    if (updateOrderError) {
      console.error('Failed to update order status:', updateOrderError);
      return {
        success: false,
        message: ERROR_MESSAGES.ORDER_NOT_UPDATED
      };
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.ORDER_COMPLAINT_ADDED
    };
  } catch (error) {
    console.error('Error while adding order in complaint section:', error);
    return {
      success: false,
      message: ERROR_MESSAGES.ORDER_COMPLAINT_NOT_ADDED
    };
  }
};

export const getComplaintByOrderId = async (
  orderId: string
): Promise<{
  success: boolean;
  message: string;
  data?: ComplaintModalType;
}> => {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('complaint')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error) {
      console.error('Error while fetching complaint', error);
      return {
        success: false,
        message: ERROR_MESSAGES.COMPLAINT_NOT_FETCHED
      };
    }

    const complaintData: ComplaintModalType = {
      image: data?.image as string,
      description: data?.description
    };

    return {
      success: true,
      message: SUCCESS_MESSAGES.COMPLAINT_FETCHED,
      data: complaintData
    };
  } catch (error) {
    console.error('Error while fetching complaint data', error);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};
