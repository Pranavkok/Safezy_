'use server';

import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/constants';
import {
  OrderedProductDetailsModalType,
  OrderedProductDetailsType,
  OrderedProductType,
  ProductHistoryType
} from '@/types/inventory.types';
import { OrderDelivered } from '@/types/order.types';
import { createClient } from '@/utils/supabase/server';
import { getUserIdFromAuth } from '../user';
import { revalidatePath } from 'next/cache';

export const addToInventory = async (orderId: string) => {
  const supabase = await createClient();

  try {
    const { data: orderItems, error: fetchError } = await supabase
      .from('order_items')
      .select(
        `id, 
        product_id, 
        product_color, 
         product_size, 
         quantity,
         product (
          ppe_name, 
          ppe_category 
          ),
          order (
              worksite_id  
              
              )
              `
      )
      .eq('order_id', orderId);

    if (fetchError) {
      console.error('Error fetching order items:', fetchError.message);
      return { success: false, message: fetchError.message };
    }

    if (!orderItems || orderItems.length === 0) {
      return { success: false, message: 'No items found in the order.' };
    }

    const userId = await getUserIdFromAuth();

    if (!userId) {
      return {
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND
      };
    }

    const inventoryEntries = orderItems.map(item => ({
      order_items_id: item.id,
      product_id: item.product_id,
      product_color: item.product_color,
      product_size: item.product_size,
      product_quantity: item.quantity,
      base_quantity: item.quantity,
      product_name: item.product?.ppe_name || null,
      product_category: item.product?.ppe_category || null,
      user_id: userId,
      worksite_id: item.order?.worksite_id
    }));

    const { error: insertError } = await supabase
      .from('product_inventory')
      .insert(inventoryEntries);

    if (insertError) {
      console.error(
        'Error inserting into product inventory:',
        insertError.message
      );
      return { success: false, message: ERROR_MESSAGES.INVENTORY_NOT_UPDATED };
    }

    const { error: updateError } = await supabase
      .from('order')
      .update({ added_to_inventory: true })
      .eq('id', orderId);

    if (updateError) {
      console.error(
        'Error updating order inventory status:',
        updateError.message
      );
      return {
        success: false,
        message: 'Inventory updated, but order status not updated.'
      };
    }

    revalidatePath('/contractor');

    return { success: true, message: SUCCESS_MESSAGES.INVENTORY_UPDATED };
  } catch (error) {
    console.error(
      'An unexpected error occurred while adding order items to product inventory',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const fetchDeliveredOrderNotAddedToInventory = async (): Promise<{
  success: boolean;
  message: string;
  data?: OrderDelivered[];
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

    const { data, error } = await supabase
      .from('order')
      .select('id,order_status,is_delivered, added_to_inventory')
      .eq('is_delivered', true)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch order id:', error);
      return {
        success: false,
        message: ERROR_MESSAGES.ORDER_ID_NOT_FETCHED
      };
    }

    revalidatePath('/contractors');

    return {
      success: true,
      message: SUCCESS_MESSAGES.ORDER_ID_FETCHED,
      data
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while fetching order id',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const getDeliveredOrdersAwaitingInventoryCount = async (): Promise<{
  count: number;
}> => {
  const supabase = await createClient();

  try {
    const userId = await getUserIdFromAuth();

    if (!userId) {
      return {
        count: 0
      };
    }

    const { count, error } = await supabase
      .from('order')
      .select('*', { count: 'exact' })
      .eq('added_to_inventory', false)
      .neq('order_status', 'Complaint')
      .eq('is_delivered', true)
      .eq('user_id', userId);

    if (error) {
      return {
        count: 0
      };
    }

    revalidatePath('/contractors');

    return {
      count: count || 0
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while fetching orders count',
      error
    );
    return {
      count: 0
    };
  }
};

export const fetchOrderedProductsForModal = async (
  worksiteId: string
): Promise<{
  success: boolean;
  message: string;
  data?: OrderedProductType[];
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

    const { data, error } = await supabase
      .from('product_inventory')
      .select(
        `
        id,
        product_name,
        product_quantity,
        product_id
      `
      )
      .eq('user_id', userId)
      .eq('worksite_id', worksiteId)
      .gt('product_quantity', 0);

    if (error) {
      console.error('Error while fetching ordered products:', error);
      return {
        success: false,
        message: ERROR_MESSAGES.INVENTORY_NOT_FETCHED
      };
    }

    const orderedProductsData = data.map(product => ({
      id: product.id,
      product_id: product.product_id,
      name: product.product_name,
      quantity: product.product_quantity,
      assigned: 0
    }));

    revalidatePath('/contractor');

    return {
      success: true,
      message: SUCCESS_MESSAGES.INVENTORY_DETAILS_FETCHED,
      data: orderedProductsData as OrderedProductType[]
    };
  } catch (error) {
    console.error('Unexpected error while fetching ordered products:', error);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const fetchOrderedProductDetails = async (
  productId: string,
  searchQuery?: string,
  page: number = 1,
  pageSize: number = 10
): Promise<{
  success: boolean;
  message: string;
  data?: OrderedProductDetailsType[];
  pageCount?: number;
}> => {
  const supabase = await createClient();

  try {
    let query = supabase
      .from('product_inventory')
      .select(
        `*,
         product_history (
            id,
            assigned_date,
            unassigned_date,
            employee (
              name
            )
         ),
         product (
            use_life
         )
        `
      )
      .eq('product_id', productId);

    if (searchQuery) {
      const { data: employeeData, error: employeeError } = await supabase
        .from('employee')
        .select('id')
        .or(`name.ilike.%${searchQuery}%`);

      if (employeeError) {
        console.error(
          'Error fetching users for search criteria:',
          employeeError
        );
      } else {
        const employeeIds = employeeData.map(employee => employee.id);
        query = query.in('user_id', employeeIds as unknown as string[]);
      }
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error while fetching inventory items:', error);
      return {
        success: false,
        message: ERROR_MESSAGES.INVENTORY_NOT_FETCHED
      };
    }

    const orderedProductDetails = data.flatMap(item => {
      const productHistories = item.product_history || [];
      const useLifeInMonths = item.product?.use_life || 0;

      return productHistories.map(history => {
        const assignedDate = new Date(history.assigned_date);

        const expirationDate = new Date(assignedDate);
        expirationDate.setMonth(expirationDate.getMonth() + useLifeInMonths);

        return {
          id: history.id,
          employeeName: history.employee?.name || 'Unknown',
          assignedDate: history.assigned_date || 'N/A',
          status: history.unassigned_date ? 'Unassigned' : 'Assigned',
          expirationDate: expirationDate.toISOString().split('T')[0]
        };
      });
    });

    return {
      success: true,
      message: SUCCESS_MESSAGES.ORDER_ITEMS_FETCHED,
      data: orderedProductDetails,
      pageCount: count ? Math.ceil(count / pageSize) : 1
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while fetching product details:',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const fetchOrderedProductDetailsModal = async (
  equipmentId: number
): Promise<{
  success: boolean;
  message: string;
  data?: OrderedProductDetailsModalType[];
  pageCount?: number;
}> => {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('product_history')
      .select(
        `id,
         assigned_date,
         unassigned_date,
         employee (name),
         product_inventory (
           product_name,
           product (use_life)
         )`
      )
      .eq('id', equipmentId);

    if (error) {
      console.error('Error while fetching inventory items:', error);
      return {
        success: false,
        message: ERROR_MESSAGES.INVENTORY_NOT_FETCHED
      };
    }

    const orderedProductDetails: OrderedProductDetailsModalType[] = (
      data as ProductHistoryType[]
    ).map(item => {
      const assignedDate = new Date(item.assigned_date);

      const useLifeInMonths: number =
        item.product_inventory?.product?.use_life || 0;

      const expirationDate = new Date(assignedDate);
      expirationDate.setMonth(expirationDate.getMonth() + useLifeInMonths);

      const currentDate = new Date();
      const timeDifference = expirationDate.getTime() - currentDate.getTime();
      const remainingLife = Math.max(
        0,
        Math.ceil(timeDifference / (1000 * 60 * 60 * 24))
      );

      return {
        id: item.id,
        assignedDate: item.assigned_date || '',
        unassignedDate: item.unassigned_date || null,
        employeeName: item.employee?.name || 'N/A',
        productName: item.product_inventory?.product_name || 'N/A',
        status: item.unassigned_date ? 'Unassigned' : 'Assigned',
        expirationDate: expirationDate.toISOString().split('T')[0],
        remainingLife
      };
    });

    return {
      success: true,
      message: SUCCESS_MESSAGES.ORDER_ITEMS_FETCHED,
      data: orderedProductDetails
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while fetching product details:',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const fetchOrderedProducts = async (
  worksiteId: string
): Promise<{
  success: boolean;
  message: string;
  data?: OrderedProductType[];
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

    const { data: inventoryData, error: inventoryError } = await supabase
      .from('product_inventory')
      .select(
        `
          id,
          product_name,
          product_quantity,
          product_id,
          base_quantity,
          product_history (
            id
          )
        `
      )
      .eq('user_id', userId)
      .eq('worksite_id', worksiteId)
      .gt('product_quantity', 0);

    if (inventoryError) {
      console.error('Error while fetching product inventory:', inventoryError);
      return {
        success: false,
        message: ERROR_MESSAGES.INVENTORY_NOT_FETCHED
      };
    }

    if (inventoryData.length === 0) {
      return {
        data: [],
        success: true,
        message: SUCCESS_MESSAGES.INVENTORY_DETAILS_FETCHED
      };
    }

    const orderedProductsData = inventoryData.map(product => {
      const assignedCount = product.product_history
        ? product.product_history.length
        : 0;

      return {
        id: product.id,
        product_id: product.product_id,
        name: product.product_name,
        quantity: product.product_quantity,
        assigned: assignedCount,
        totalQuantity: product.base_quantity
      };
    });

    revalidatePath('/contractor');

    return {
      success: true,
      message: SUCCESS_MESSAGES.INVENTORY_DETAILS_FETCHED,
      data: orderedProductsData as OrderedProductType[]
    };
  } catch (error) {
    console.error('Unexpected error while fetching ordered products:', error);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const fetchInTransitProducts = async (
  worksiteId: string
): Promise<{
  success: boolean;
  message: string;
  data?: {
    productId: string;
    name: string;
    inTransit: number;
  }[];
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

    const { data: orderData, error: orderError } = await supabase
      .from('order')
      .select('id, worksite_id')
      .eq('worksite_id', worksiteId)
      .neq('order_status', 'Delivered')
      .neq('order_status', 'Complaint')
      .eq('added_to_inventory', false)
      .eq('user_id', userId);

    if (orderError) {
      console.error('Error while fetching orders:', orderError);
      return {
        success: false,
        message: ERROR_MESSAGES.IN_TRANSIT_ITEMS_FETCH_FAILED
      };
    }

    if (!orderData || orderData.length === 0) {
      return {
        success: true,
        message: SUCCESS_MESSAGES.IN_TRANSIT_ITEMS_FETCHED,
        data: []
      };
    }

    const orderIds = orderData.map(order => order.id);
    const { data: orderItemsData, error: itemsError } = await supabase
      .from('order_items')
      .select(
        `
        quantity,
        product!inner(
          id,
          ppe_name,
          geographical_location
        )
      `
      )
      .in('order_id', orderIds);

    if (itemsError) {
      console.error('Error while fetching order items:', itemsError);
      return {
        success: false,
        message: ERROR_MESSAGES.IN_TRANSIT_ITEMS_FETCH_FAILED
      };
    }

    const inTransitData =
      orderItemsData.map(orderItem => ({
        productId: orderItem.product?.id || '',
        name: orderItem.product?.ppe_name || '',
        inTransit: orderItem.quantity || 0
      })) || [];

    return {
      success: true,
      message: SUCCESS_MESSAGES.IN_TRANSIT_ITEMS_FETCHED,
      data: inTransitData
    };
  } catch (error) {
    console.error('Error while fetching ordered products:', error);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};
