'use server';

import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  USER_ROLES
} from '@/constants/constants';
import { WarehouseOperatorSignUpType } from '@/sections/auth/SignUpWarehouseOperatorSection';
import { SearchPaginationProps } from '@/types/index.types';
import { createClient } from '@/utils/supabase/server';

export interface WarehouseWithAddressType {
  address: string;
  id: string;
  contact_number: string;
  email: string;
  first_name: string;
  is_active: boolean | null;
}

// Fetch all warehouses
export const fetchAllWarehouseOperators = async ({
  searchQuery,
  sortBy,
  sortOrder,
  page = 1,
  pageSize = 10
}: SearchPaginationProps): Promise<{
  success: boolean;
  message: string;
  data?: WarehouseWithAddressType[];
  pageCount?: number;
}> => {
  const supabase = await createClient();

  try {
    let query = supabase
      .from('users')
      .select('*,address(*), user_roles!inner(role)', { count: 'exact' })
      .eq('user_roles.role', USER_ROLES.WAREHOUSE_OPERATOR);

    if (searchQuery) {
      query = query.or(`first_name.ilike.%${searchQuery}%`);
    }

    if (sortBy) {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching warehouse details:', error);
      return { success: false, message: ERROR_MESSAGES.WAREHOUSE_NOT_FETCHED };
    }

    const warehouseDetails = data?.map(warehouse => {
      const address = warehouse.address[0];
      const fullAddress = [
        address?.street1,
        address?.street2,
        address?.locality,
        address?.city,
        address?.state,
        address?.zipcode
      ]
        .filter(Boolean)
        .join(', ');

      return {
        id: warehouse.id,
        contact_number: warehouse.contact_number,
        email: warehouse.email,
        first_name: warehouse.first_name,
        address: fullAddress,
        is_active: warehouse.is_active
      };
    });

    return {
      success: true,
      message: SUCCESS_MESSAGES.WAREHOUSE_FETCHED,
      data: warehouseDetails,
      pageCount: count ? Math.ceil(count / pageSize) : 1
    };
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    return {
      success: false,
      message: error.message || ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const addWarehouseOperatorDetails = async (
  userDetails: WarehouseOperatorSignUpType,
  authId: string,
  roleId: number
): Promise<{ success: boolean; message: string }> => {
  const warehouseOperatorDetails = {
    first_name: userDetails.storeName,
    last_name: userDetails.storeName,
    contact_number: userDetails.contactNumber,
    email: userDetails.email,
    auth_id: authId,
    role_id: roleId
  };

  const addressDetails = {
    street1: userDetails.address1,
    street2: userDetails.address2,
    locality: userDetails.locality,
    country: userDetails.country,
    city: userDetails.city,
    state: userDetails.state,
    zipcode: userDetails.zipcode
  };

  const supabase = await createClient();

  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert(warehouseOperatorDetails)
      .select('*')
      .single();

    if (userError) {
      console.error('Error inserting warehouse operator details:', userError);
      return { success: false, message: ERROR_MESSAGES.WAREHOUSE_NOT_ADDED };
    }

    const userId = userData.id;

    const { error: addressError } = await supabase
      .from('address')
      .insert({ ...addressDetails, user_id: userId });

    if (addressError) {
      console.error('Error inserting address details:', addressError);
      return { success: false, message: ERROR_MESSAGES.ADDRESS_NOT_ADDED };
    }

    return { success: true, message: SUCCESS_MESSAGES.WAREHOUSE_ADDED };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};
