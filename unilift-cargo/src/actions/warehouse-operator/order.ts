'use server';

import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/constants';
import {
  OrderStatusType,
  UpdateOrderByWarehouseOperator
} from '@/types/order.types';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendPushNotification } from '@/lib/web-push';

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

    if (orderStatus === 'Delivered') {
      const { data: orderRow } = await supabase
        .from('order')
        .select('user_id')
        .eq('id', orderId)
        .single();

      if (orderRow?.user_id) {
        const { data: userRow } = await supabase
          .from('users')
          .select('auth_id')
          .eq('id', orderRow.user_id)
          .single();

        if (userRow?.auth_id) {
          sendPushNotification(userRow.auth_id, 'order_delivered', {
            title: 'Order Delivered',
            body: `Your order #${orderId} has been delivered. Add items to inventory or raise a complaint.`,
            url: '/contractor/notifications',
          }).catch((err) => console.error('[push] order delivered notification failed:', err));
        }
      }
    }

    return { success: true, message: SUCCESS_MESSAGES.ORDER_UPDATED };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};
