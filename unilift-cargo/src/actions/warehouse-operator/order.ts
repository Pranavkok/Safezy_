'use server';

import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/constants';
import {
  OrderStatusType,
  UpdateOrderByWarehouseOperator
} from '@/types/order.types';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export const updateOrderDetailsByWarehouseOperator = async (
  orderId: string,
  saveDetails: {
    orderStatus?: string;
    estimatedDeliveryDate?: string;
  }
) => {
  const supabase = await createClient();

  try {
    const { orderStatus, estimatedDeliveryDate } = saveDetails;

    const updateData: UpdateOrderByWarehouseOperator = {
      order_status: orderStatus as OrderStatusType,
      estimated_delivery_date: estimatedDeliveryDate
    };

    if (orderStatus === 'Delivered') {
      updateData.is_delivered = true;
    }

    const { error } = await supabase
      .from('order')
      .update(updateData)
      .eq('id', orderId)
      .select();

    if (error) {
      console.error('Error updating order details:', error);
      return { success: false, message: ERROR_MESSAGES.ORDER_NOT_UPDATED };
    }

    revalidatePath('/warehouse-operator/manage-order');

    return { success: true, message: SUCCESS_MESSAGES.ORDER_UPDATED };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};
