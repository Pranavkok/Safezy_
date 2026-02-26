'use server';

import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  USER_ROLES
} from '@/constants/constants';
import { CountsType } from '@/types/dashboard.types';
import { createClient } from '@/utils/supabase/server';

// [#] Fetch counts of contractors, orders, products, and complaints
export const getAdminCounts = async (): Promise<{
  success: boolean;
  data?: CountsType;
  message: string;
}> => {
  const supabase = await createClient();

  try {
    const [
      { count: contractorsCount, error: contractorsError },
      { count: ordersCount, error: OrdersError },
      { count: productsCount, error: ProductsError },
      { count: complaintsCount, error: complaintsError }
    ] = await Promise.all([
      supabase
        .from('users')
        .select(
          `
        id, 
        user_roles!inner(role)
      `,
          { count: 'exact', head: true }
        )
        .eq('user_roles.role', USER_ROLES.CONTRACTOR),
      supabase.from('order').select('id', { count: 'exact', head: true }),
      supabase
        .from('product')
        .select('id', { count: 'exact', head: true })
        .eq('is_deleted', false),
      supabase.from('complaint').select('id', { count: 'exact', head: true })
    ]);

    if (contractorsError || OrdersError || ProductsError || complaintsError) {
      return {
        success: false,
        message: ERROR_MESSAGES.UNEXPECTED_ERROR
      };
    }

    return {
      success: true,
      data: {
        contractors: contractorsCount || 0,
        orders: ordersCount || 0,
        products: productsCount || 0,
        complaints: complaintsCount || 0
      },
      message: SUCCESS_MESSAGES.COUNT_FETCHED
    };
  } catch (err) {
    console.error('Error fetching counts:', err);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};
