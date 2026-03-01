'use server';

import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  USER_ROLES
} from '@/constants/constants';
import {
  FetchOrderItemsParams,
  FetchOrderParams,
  OrderDetailsForWarehouseOperatorType,
  OrderItemsListingType,
  OrderListingContractorType,
  UDF1Type,
  OrderDetailsJsonType,
  UDF3Type,
  OrderDetailsForAdmin
} from '@/types/order.types';
import { createAdminClient, createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { getUserIdFromAuth, getAuthId } from '../user';
import { sendPushNotification } from '@/lib/web-push';

// Orders placed by a contractor
export const fetchAllOrdersByContractor = async ({
  worksiteId,
  orderStatus = undefined,
  sortBy = 'created_at',
  sortOrder = 'desc',
  page = 1,
  pageSize = 10
}: FetchOrderParams): Promise<{
  success: boolean;
  message: string;
  data?: OrderListingContractorType[];
  pageCount?: number;
}> => {
  const supabase = await createClient();
  try {
    const userId = await getUserIdFromAuth();

    if (!userId) {
      return {
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND
      };
    }

    let query = supabase
      .from('order')
      .select(
        `
          id, 
          date, 
          total_amount, 
          order_status,
          order_items ( quantity ),
          created_at
        `,
        { count: 'exact' }
      )
      .eq('user_id', userId)
      .eq('worksite_id', worksiteId as string);

    if (orderStatus) {
      query = query.eq('order_status', orderStatus);
    }

    if (['date', 'created_at', 'total_amount'].includes(sortBy)) {
      if (sortBy === 'date') {
        query = query.order('created_at', { ascending: sortOrder === 'asc' });
      } else {
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      }
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      return {
        success: false,
        message: ERROR_MESSAGES.ORDER_NOT_FETCHED
      };
    }

    const filteredData = data;

    const formattedOrders = filteredData.map(order => ({
      id: order.id,
      date: order.date,
      total_amount: order.total_amount,
      order_status: order.order_status,
      total_quantity: order.order_items.reduce(
        (acc: number, item: { quantity: number }) => acc + item.quantity,
        0
      )
    }));

    return {
      success: true,
      message: SUCCESS_MESSAGES.ORDER_FETCHED,
      data: formattedOrders,
      pageCount: count ? Math.ceil(count / pageSize) : 1
    };
  } catch (error) {
    console.error('An unexpected error occurred while fetching orders:', error);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const fetchOrderBasicDetails = async (orderId: string) => {
  const supabase = await createClient();

  try {
    const { data: orderData, error: orderError } = await supabase
      .from('order')
      .select(
        `id,
        date,
        total_amount,
        order_status,
        shipping_charges,
        order_details,
        order_status, 
        warehouse_operator_id,
        estimated_delivery_date
        `
      )
      .eq('id', orderId)
      .single();

    if (orderError || !orderData) {
      return {
        success: false,
        message: orderError?.message || ERROR_MESSAGES.ORDER_NOT_FETCHED
      };
    }

    const grandTotal = orderData.total_amount;
    const orderDetails = orderData.order_details as OrderDetailsJsonType;

    return {
      success: true,
      message: SUCCESS_MESSAGES.ORDER_FETCHED,
      data: {
        order_id: orderData.id,
        date: orderData.date,
        grand_total: grandTotal,
        shipping_charges: orderData.shipping_charges || 0,
        user: {
          first_name: orderDetails.contractor.firstName,
          last_name: orderDetails.contractor.lastName,
          company_name: orderDetails.contractor.companyName,
          email: orderDetails.contractor.email,
          contact_number: orderDetails.contractor.contactNumber
        },
        street1: orderDetails.address.street1,
        street2: orderDetails.address.street2 ?? '',
        locality: orderDetails.address.locality ?? '',
        city: orderDetails.address.city,
        state: orderDetails.address.state,
        country: orderDetails.address.country,
        zipcode: orderDetails.address.zipcode,
        order_status: orderData.order_status,
        warehouse_operator_id: orderData.warehouse_operator_id,
        estimated_delivery_date: orderData.estimated_delivery_date
      }
    };
  } catch (err) {
    console.error(
      'Unexpected error occurred while fetching order basic details:',
      err
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const fetchOrderItems = async ({
  orderId,
  page = 1,
  pageSize = 10
}: FetchOrderItemsParams): Promise<{
  success: boolean;
  message: string;
  data?: OrderItemsListingType[];
  pageCount?: number;
}> => {
  const supabase = await createClient();

  try {
    let query = supabase
      .from('order_items')
      .select(
        `
      id,
      price,
      quantity,
      product_size,
      product_color,
      product(
          id,
          ppe_name,
          ppe_category,
          size,
          image,
          brand_name
      )
    `,
        { count: 'exact' }
      )
      .eq('order_id', orderId);

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      return {
        success: false,
        message: error.message || ERROR_MESSAGES.ORDER_ITEMS_NOT_FETCHED
      };
    }

    const formattedData = data.map(item => ({
      id: item.id,
      price: item.price,
      product_id: item.product?.id,
      ppe_category: item.product?.ppe_category,
      size: item.product_size,
      color: item.product_color,
      ppe_name: item.product?.ppe_name,
      image: item.product?.image,
      quantity: item.quantity,
      brand_name: item.product?.brand_name,
      total_price: item.price * item.quantity
    }));

    return {
      success: true,
      message: SUCCESS_MESSAGES.ORDER_ITEMS_FETCHED,
      data: formattedData as OrderItemsListingType[],
      pageCount: count ? Math.ceil(count / pageSize) : 1
    };
  } catch (err) {
    console.error('Unexpected error occurred while fetching order items:', err);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

// Add new order
export const placeOrder = async (
  orderDetails: UDF1Type,
  userDetails: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    companyName: string;
  },
  otherDetails: UDF3Type
) => {
  const supabase = await createAdminClient();
  try {
    const userId = userDetails?.userId;

    const { data: cartItems, error: fetchError } = await supabase
      .from('cart_items')
      .select(
        'product_color, product_size, quantity, item_price, product(id, ppe_name, ppe_category, sub_category,  gst, hsn_code, product_ID)'
      )
      .eq('user_id', userId);

    if (fetchError) {
      console.error(`Error fetching cart items: `, fetchError);
      return {
        success: false,
        message: ERROR_MESSAGES.CART_ITEMS_NOT_FETCHED
      };
    }

    if (!cartItems || cartItems.length === 0) {
      console.error(ERROR_MESSAGES.CART_EMPTY);
      return {
        success: false,
        message: ERROR_MESSAGES.CART_EMPTY
      };
    }

    const INITIAL_ORDER_STATUS:
      | 'Pending'
      | 'Processing'
      | 'Delivered'
      | 'Cancelled'
      | 'Returned'
      | 'Shipped' = 'Processing';

    const { data: newOrder, error: orderError } = await supabase
      .from('order')
      .insert({
        user_id: userId,
        date: orderDetails.date,
        order_status: INITIAL_ORDER_STATUS,
        total_amount: orderDetails.totalAmount,
        shipping_charges: orderDetails.shippingCharges,
        worksite_id: otherDetails.worksiteId,
        order_details: {
          address: otherDetails.address,
          contractor: {
            firstName: userDetails.firstName,
            lastName: userDetails.lastName,
            email: userDetails.email,
            contactNumber: userDetails.phone,
            companyName: userDetails.companyName
          }
        }
      })
      .select('id')
      .single();

    if (orderError) {
      console.error(`Error creating order:`, orderError);
      return {
        success: false,
        message: ERROR_MESSAGES.ORDER_NOT_ADDED
      };
    }

    const orderId = newOrder.id;

    const orderItems = cartItems.map(item => ({
      order_id: orderId,
      product_id: item.product.id,
      product_color: item.product_color,
      product_size: item.product_size,
      product_name: item.product?.ppe_name,
      quantity: item.quantity,
      price: item.item_price,
      order_item_details: {
        product: item.product
      }
    }));

    const [{ error: insertOrderItemsError }, { error: deleteCartItemsError }] =
      await Promise.all([
        supabase.from('order_items').insert(orderItems),
        supabase.from('cart_items').delete().eq('user_id', userId)
      ]);

    if (insertOrderItemsError) {
      console.error('Error inserting order items:', insertOrderItemsError);
      return {
        success: false,
        message: ERROR_MESSAGES.ORDER_ITEMS_NOT_ADDED
      };
    }

    if (deleteCartItemsError) {
      console.error('Error deleting cart items:', deleteCartItemsError);
      return {
        success: false,
        message: ERROR_MESSAGES.CART_ITEM_NOT_REMOVED
      };
    }

    revalidatePath('/cart');

    // Reset cart reminder tracking since the cart has been cleared by order placement
    supabase
      .from('cart_reminder_tracking')
      .upsert(
        { user_id: userId, last_cart_activity: null, reminders_sent: 0, last_reminder_at: null },
        { onConflict: 'user_id' }
      )
      .then(() => {})
      .catch(() => {});

    getAuthId()
      .then((authId) => {
        if (authId) {
          sendPushNotification(authId, 'order_placed', {
            title: 'Order Placed Successfully',
            body: `Your order #${orderId} has been placed and is being processed.`,
            url: '/contractor/orders',
          }).catch((err) => console.error('[push] order placed notification failed:', err));
        }
      })
      .catch(() => {});

    return {
      success: true,
      message: SUCCESS_MESSAGES.ORDER_ADDED,
      orderId
    };
  } catch (error) {
    console.error('Order placement error:', error);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

// Fetch all the warehouses
export const fetchWarehouseDetails = async () => {
  const supabase = await createClient();

  try {
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, first_name, email, user_roles!inner(role)')
      .eq('user_roles.role', USER_ROLES.WAREHOUSE_OPERATOR)
      .eq('is_active', true);

    // Handle errors from user fetch
    if (usersError) {
      console.error('Error fetching warehouse details:', usersError);
      return { success: false, message: ERROR_MESSAGES.WAREHOUSE_NOT_FETCHED };
    }

    const warehouseOperators = usersData.map(user => {
      return {
        id: user.id,
        store_name: user.first_name,
        email: user.email
      };
    });

    // Return success with the fetched users data
    return {
      success: true,
      message: SUCCESS_MESSAGES.WAREHOUSE_FETCHED,
      data: warehouseOperators
    };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};

// Update manage order details
export const updateOrderDetails = async (
  orderId: string,
  saveDetails: {
    warehouseId: string;
  }
) => {
  const supabase = await createClient();

  try {
    const { warehouseId } = saveDetails;

    const { error } = await supabase
      .from('order')
      .update({
        warehouse_operator_id: warehouseId
      })
      .eq('id', orderId)
      .select();

    if (error) {
      console.error('Error updating order details:', error);
      return { success: false, message: ERROR_MESSAGES.ORDER_NOT_UPDATED };
    }

    revalidatePath('/admin/orders');

    return { success: true, message: SUCCESS_MESSAGES.ORDER_UPDATED };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};

export const fetchOrderDetailsForWarehouseOperator = async (
  orderId: string
): Promise<{
  success: boolean;
  message: string;
  data: OrderDetailsForWarehouseOperatorType;
}> => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('order')
      .select(
        `
            id,
            estimated_delivery_date,
            order_status,
            order_details
        `
      )
      .eq('id', orderId)
      .maybeSingle();

    const orderDetails = data?.order_details as OrderDetailsJsonType;

    const contractor = orderDetails?.contractor;

    const orderData = {
      id: orderId,
      order_status: data?.order_status,
      estimated_delivery_date: data?.estimated_delivery_date,
      street1: orderDetails?.address.street1,
      street2: orderDetails?.address.street2 ?? '',
      locality: orderDetails?.address.locality ?? '',
      city: orderDetails?.address.city,
      state: orderDetails?.address.state,
      country: orderDetails?.address.country,
      zipcode: orderDetails?.address.zipcode,
      first_name: contractor?.firstName,
      last_name: contractor?.lastName,
      company_name: contractor?.companyName,
      email: contractor?.email,
      contact_number: contractor?.contactNumber
    };

    if (error) throw error;

    return {
      success: true,
      message: SUCCESS_MESSAGES.ORDER_FETCHED,
      data: orderData
    };
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw error;
  }
};

export const fetchOrderDetailsForAdmin = async (
  orderId: string
): Promise<{
  success: boolean;
  message: string;
  data?: OrderDetailsForAdmin[];
}> => {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('order')
      .select(
        `
        is_email_sent,
        date,
        total_amount,
        users!user_id (
          first_name,
          last_name,
          email,
          contact_number
          ),
        order_items (
          price,
          quantity,
          product_color,
          product_size,
          product:product_id (
              ppe_name,
              ppe_category,
              brand_name,
              size
              )
              )
              `
      )
      .eq('id', orderId);

    if (error) {
      console.error('Error while fetching order details', error);
      return {
        success: false,
        message: ERROR_MESSAGES.ORDER_ITEMS_NOT_FETCHED
      };
    }

    const formattedData: OrderDetailsForAdmin[] = data.map(order => {
      const { date, total_amount, users, order_items, is_email_sent } = order;

      return {
        id: orderId,
        date,
        is_email_sent,
        total_amount,
        users: {
          first_name: users.first_name,
          last_name: users.last_name,
          email: users.email,
          contact_number: users.contact_number
        },
        order_items: order_items.map(item => ({
          price: item.price,
          quantity: item.quantity,
          product_color: item.product_color,
          product_size: item.product_size,
          product: {
            ppe_name: item.product.ppe_name,
            ppe_category: item.product.ppe_category,
            brand_name: item.product.brand_name,
            size: item.product.size
          }
        }))
      };
    });

    return {
      success: true,
      message: SUCCESS_MESSAGES.ORDER_ITEM_DETAILS_FETHCED,
      data: formattedData
    };
  } catch (error) {
    console.error('Error fetching order details:', error);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const fetchOrderIdFromTransactionId = async (pgtID: string) => {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('transaction')
      .select('id')
      .eq('payment_gateway_transaction_id', pgtID)
      .maybeSingle();

    const transactionId = data?.id;

    const { data: orderData, error: orderError } = await supabase
      .from('order')
      .select('id')
      .eq('transaction_id', transactionId as number)
      .maybeSingle();

    if (orderError) {
      console.error('orderError', orderError);
    }

    if (error) {
      console.error('Error while fetching order id', error);
      return {
        success: false,
        message: ERROR_MESSAGES.ORDER_NOT_FETCHED
      };
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.ORDER_FETCHED,
      data: orderData?.id
    };
  } catch (error) {
    console.error('Error fetching order details:', error);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};
