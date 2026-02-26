'use server';

import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/constants';
import { createClient } from '@/utils/supabase/server';
import { InvoiceDataType } from '@/types/invoice.types';
import {
  OrderDetailsJsonType,
  OrderItemDetailsJsonType
} from '@/types/order.types';

// Fetch the invoice data
export const getInvoiceData = async (
  orderId: string
): Promise<{ success: boolean; message: string; data?: InvoiceDataType }> => {
  const supabase = await createClient();

  try {
    const { data: orderData, error: orderError } = await supabase
      .from('order')
      .select(
        `
         id,
         date,
         shipping_charges,
         order_details,
         order_items (
            quantity,
            product_size,
            product_color,
            price,
            order_item_details
        ),
        transaction (
            payment_gateway_transaction_id,
            payment_mode
        )   
            `
      )
      .eq('id', orderId)
      .single();

    if (orderError) {
      console.error('Error while fetching order details', orderError);
      return {
        success: false,
        message: ERROR_MESSAGES.ORDER_NOT_FETCHED
      };
    }

    const orderDetails = orderData?.order_details as OrderDetailsJsonType;

    const invoiceData: InvoiceDataType = {
      contractor: {
        firstName: orderDetails.contractor.firstName ?? '-',
        lastName: orderDetails.contractor.lastName ?? '-',
        email: orderDetails.contractor.email ?? '-',
        contactNumber: orderDetails.contractor.contactNumber ?? '-'
      },
      order: {
        id: orderData?.id ?? '-',
        date: orderData?.date ?? '-',
        shippingCharges: orderData?.shipping_charges ?? 0,
        address: Object.values(orderDetails.address).filter(Boolean).join(', '),
        orderItems: orderData?.order_items.map(item => {
          const product = (item.order_item_details as OrderItemDetailsJsonType)
            .product;

          return {
            quantity: item.quantity,
            price: item.price,
            size: item.product_size ?? '-',
            color: item.product_color ?? '-',
            product: {
              id: product?.id,
              ppeName: product?.ppe_name,
              gst: product?.gst,
              hsnCode: product?.hsn_code,
              productId: product?.product_ID
            }
          };
        }),
        transaction: {
          tnxId: orderData?.transaction
            ?.payment_gateway_transaction_id as string,
          paymentMode: orderData?.transaction?.payment_mode as string
        }
      }
    };

    return {
      success: true,
      message: SUCCESS_MESSAGES.INVOICE_DATA_FETCHED,
      data: invoiceData
    };
  } catch (error) {
    console.error('Error while fetching data', error);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};
