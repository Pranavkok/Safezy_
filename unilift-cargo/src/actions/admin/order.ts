'use server';

import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/constants';
import { AdminContractorOrdersTableColumnType } from '@/types/contractor.types';
import {
  ContractorJsonType,
  FetchOrderParams,
  OrderListingType
} from '@/types/order.types';
import { createClient } from '@/utils/supabase/server';

// Orders placed by individual user
export const fetchOrdersByUser = async (
  userId: string,
  sortBy: string = 'date',
  sortOrder: string = 'asc',
  page: number = 1,
  pageSize: number = 10
): Promise<{
  success: boolean;
  message: string;
  data?: AdminContractorOrdersTableColumnType[];
  pageCount?: number;
}> => {
  const supabase = await createClient();
  try {
    let query = supabase
      .from('order')
      .select(
        `
              id,
              date,
              total_amount,
              order_status,
              order_items (quantity)
            `,
        { count: 'exact' }
      )
      .eq('user_id', userId);

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const validSortColumns = ['date', 'total_amount', 'order_status'];
    if (!validSortColumns.includes(sortBy) && sortBy !== 'total_quantity') {
      sortBy = 'date';
    }

    if (sortBy === 'total_quantity') {
      const { data: sortedData, error: sortedError, count } = await query;

      if (sortedError) throw sortedError;

      const formattedOrders = sortedData.map(order => ({
        id: order.id,
        date: order.date,
        total_amount: order.total_amount,
        order_status: order.order_status,
        total_quantity: order.order_items.reduce(
          (acc: number, item: { quantity: number }) => acc + item.quantity,
          0
        )
      }));

      const sortedByQuantity = formattedOrders.sort((a, b) =>
        sortOrder === 'asc'
          ? a.total_quantity - b.total_quantity
          : b.total_quantity - a.total_quantity
      );

      return {
        success: true,
        message: SUCCESS_MESSAGES.ORDER_FETCHED,
        data: sortedByQuantity,
        pageCount: count ? Math.ceil(count / pageSize) : 1
      };
    } else {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    }

    const { data, error, count } = await query;

    if (error) {
      return {
        success: false,
        message: error.message || ERROR_MESSAGES.ORDER_NOT_FETCHED
      };
    }

    const formattedOrders = data.map(order => ({
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
  } catch (err) {
    console.error('Unexpected error occurred while fetching orders:', err);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

// Fetch all orders
export const fetchAllOrders = async ({
  searchQuery = '',
  orderStatus = undefined,
  sortBy = 'created_at',
  sortOrder = 'desc',
  page = 1,
  pageSize = 10
}: FetchOrderParams): Promise<{
  success: boolean;
  message: string;
  data?: OrderListingType[];
  pageCount?: number;
}> => {
  const supabase = await createClient();

  try {
    const isQuantitySort = sortBy === 'total_quantity';

    let query = supabase.from('order').select(
      `
          id, 
          date, 
          total_amount, 
          order_status,
          order_items (
              quantity
          ),
          warehouse_operator:users!order_warehouse_operator_id_fkey (
            first_name
          ),
          order_details->contractor
         
        `,
      { count: 'exact' }
    );

    if (searchQuery) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .or(
          `first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`
        );

      if (userError) {
        console.error('Error fetching users for search criteria:', userError);
      } else {
        const userIds = userData.map(user => user.id);
        query = query.in('user_id', userIds);
      }
    }

    if (orderStatus) {
      query = query.eq('order_status', orderStatus);
    }

    if (isQuantitySort) {
      const { data: allData, error } = await query;

      if (error) {
        return {
          success: false,
          message: error.message || ERROR_MESSAGES.ORDER_NOT_FETCHED
        };
      }

      const processedData = allData.map(order => {
        const contractor = order.contractor as ContractorJsonType;
        return {
          id: order.id,
          date: order.date,
          total_amount: order.total_amount,
          order_status: order.order_status,
          first_name: contractor?.firstName ?? '',
          last_name: contractor?.lastName ?? '',
          warehouse: order.warehouse_operator?.first_name,
          email: contractor?.email ?? '',
          total_quantity: order.order_items.reduce(
            (acc: number, item: { quantity: number }) => acc + item.quantity,
            0
          )
        };
      });

      processedData.sort((a, b) => {
        return sortOrder === 'asc'
          ? a.total_quantity - b.total_quantity
          : b.total_quantity - a.total_quantity;
      });

      const totalCount = processedData.length;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = processedData.slice(startIndex, endIndex);

      return {
        success: true,
        message: SUCCESS_MESSAGES.ORDER_FETCHED,
        data: paginatedData,
        pageCount: Math.ceil(totalCount / pageSize)
      };
    } else {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        return {
          success: false,
          message: error.message || ERROR_MESSAGES.ORDER_NOT_FETCHED
        };
      }

      const filteredData = data;

      const formattedOrders = filteredData.map(order => {
        const contractor = order.contractor as ContractorJsonType;
        return {
          id: order.id,
          date: order.date,
          total_amount: order.total_amount,
          order_status: order.order_status,
          first_name: contractor?.firstName ?? '',
          last_name: contractor?.lastName ?? '',
          warehouse: order.warehouse_operator?.first_name,
          email: contractor?.email ?? '',
          total_quantity: order.order_items.reduce(
            (acc: number, item: { quantity: number }) => acc + item.quantity,
            0
          )
        };
      });

      return {
        success: true,
        message: SUCCESS_MESSAGES.ORDER_FETCHED,
        data: formattedOrders,
        pageCount: count ? Math.ceil(count / pageSize) : 1
      };
    }
  } catch (err) {
    console.error('Unexpected error occurred while fetching orders:', err);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};
