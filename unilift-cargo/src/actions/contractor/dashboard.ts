'use server';

import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/constants';
import { createClient } from '@/utils/supabase/server';
import { getAuthId } from '../user';

// [#] Fetch counts of orders, equipments, employees, worksites
export const getContractorCounts = async (): Promise<{
  success: boolean;
  data?: {
    orders: number;
    equipments: number;
    employees: number;
    worksites: number;
  };
  message: string;
}> => {
  const supabase = await createClient();

  try {
    const authId = await getAuthId();

    if (!authId) {
      return {
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND
      };
    }

    const [
      { count: ordersCount, error: ordersError },
      { data: equipmentData, error: equipmentError },
      { count: employeeCount, error: employeeError },
      { count: worksiteCount, error: worksiteError }
    ] = await Promise.all([
      supabase
        .from('order')
        .select(
          `
        id,
        users:order_user_id_fkey!inner(auth_id)
      `,
          { count: 'exact', head: true }
        )
        .eq('users.auth_id', authId),
      supabase
        .from('product_inventory')
        .select('base_quantity, users!inner(auth_id)', { count: 'exact' })
        .eq('users.auth_id', authId),
      supabase
        .from('employee')
        .select('id, users!inner(auth_id)', { count: 'exact', head: true })
        .eq('users.auth_id', authId),
      supabase
        .from('worksite')
        .select('id, users!inner(auth_id)', { count: 'exact', head: true })
        .eq('users.auth_id', authId)
    ]);

    if (ordersError || equipmentError || employeeError || worksiteError) {
      return {
        success: false,
        message: ERROR_MESSAGES.UNEXPECTED_ERROR
      };
    }

    return {
      success: true,
      data: {
        orders: ordersCount ?? 0,
        equipments:
          equipmentData?.reduce((acc, data) => {
            return acc + data.base_quantity!;
          }, 0) || 0,
        employees: employeeCount ?? 0,
        worksites: worksiteCount ?? 0
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
