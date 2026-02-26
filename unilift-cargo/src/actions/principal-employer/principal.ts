'use server';

import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/constants';
import { PrincipalRegisterType } from '@/types/auth.types';
import { createClient } from '@/utils/supabase/server';
import {
  generateUniqueCode,
  getWorksiteIDFromUniqueCode
} from '@/actions/index';
import { generateRandomString } from '@/lib';
import { FetchOrderParamsPUser } from '@/types/principal.types';
import { OrderListingContractorType } from '@/types/order.types';
import { OrderedProductType } from '@/types/inventory.types';
import { EmployeeType } from '@/types/index.types';
import { EmployeePPEHistoryType } from '@/types/employee.types';

export const addPrincipalDetails = async (
  userDetails: PrincipalRegisterType,
  authId: string,
  roleId: number
): Promise<{ success: boolean; message: string }> => {
  const uniqueCode: string = await generateUniqueCode(
    userDetails.fName,
    generateRandomString(5),
    userDetails.contactNumber,
    generateRandomString(5)
  );

  const PrincipalDetails = {
    first_name: userDetails.fName,
    contact_number: userDetails.contactNumber,
    email: userDetails.email,
    last_name: userDetails.fName,
    auth_id: authId,
    role_id: roleId,
    user_unique_code: uniqueCode
  };

  const supabase = await createClient();

  try {
    const { error } = await supabase.from('users').insert(PrincipalDetails);

    if (error) {
      console.error('Error inserting contractor details:', error);
      return {
        success: false,
        message: ERROR_MESSAGES.PRINCIPAL_USER_NOT_FETCHED
      };
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.PRINCIPAL_USER_DETAILS_ADDED
    };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, message: ERROR_MESSAGES.CONTRACTOR_NOT_ADDED };
  }
};

export const fetchAllOrdersByContractorPUser = async ({
  uniqueCode,
  orderStatus = undefined,
  sortBy = 'date',
  sortOrder = 'asc',
  page = 1,
  pageSize = 10
}: FetchOrderParamsPUser): Promise<{
  success: boolean;
  message: string;
  data?: OrderListingContractorType[];
  pageCount?: number;
}> => {
  const supabase = await createClient();
  try {
    const worksiteResponse = await getWorksiteIDFromUniqueCode(uniqueCode);

    if (!worksiteResponse.success || !worksiteResponse.data) {
      return {
        success: false,
        message: ERROR_MESSAGES.WORKSITE_AND_USER_IDS_NOT_FOUND
      };
    }

    const { worksiteId, userId } = worksiteResponse.data;

    let query = supabase
      .from('order')
      .select(
        `
          id, 
          date, 
          total_amount, 
          order_status,
          order_items ( quantity ),
          worksite_id
        `,
        { count: 'exact' }
      )
      .eq('user_id', userId)
      .eq('worksite_id', worksiteId);

    if (orderStatus) {
      query = query.eq('order_status', orderStatus);
    }

    if (['date', 'total_amount'].includes(sortBy)) {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
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

    const sortedOrders = ['total_quantity'].includes(sortBy)
      ? formattedOrders.sort((a, b) => {
          const fieldA = a[sortBy as keyof typeof a];
          const fieldB = b[sortBy as keyof typeof b];

          if (typeof fieldA === 'string' && typeof fieldB === 'string') {
            return sortOrder === 'asc'
              ? fieldA.localeCompare(fieldB)
              : fieldB.localeCompare(fieldA);
          } else if (typeof fieldA === 'number' && typeof fieldB === 'number') {
            return sortOrder === 'asc' ? fieldA - fieldB : fieldB - fieldA;
          } else {
            return 0;
          }
        })
      : formattedOrders;

    return {
      success: true,
      message: SUCCESS_MESSAGES.ORDER_FETCHED,
      data: sortedOrders,
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

export const fetchOrderedProductsPUser = async (
  uniqueCode: string
): Promise<{
  success: boolean;
  message: string;
  data?: OrderedProductType[];
}> => {
  const supabase = await createClient();

  try {
    const worksiteResponse = await getWorksiteIDFromUniqueCode(uniqueCode);

    if (!worksiteResponse.success || !worksiteResponse.data) {
      return {
        success: false,
        message: ERROR_MESSAGES.WORKSITE_AND_USER_IDS_NOT_FOUND
      };
    }

    const { worksiteId, userId } = worksiteResponse.data;

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

    if (!inventoryData || inventoryData.length === 0) {
      return {
        success: false,
        message: ERROR_MESSAGES.INVENTORY_NOT_FETCHED
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

export const getEmployeePUser = async (
  uniqueCode: string,
  searchQuery?: string,
  sortBy?: string,
  sortOrder?: string,
  page: number = 1,
  pageSize: number = 10
): Promise<{
  success: boolean;
  message: string;
  data?: EmployeeType[];
  pageCount?: number;
}> => {
  const supabase = await createClient();
  try {
    const worksiteResponse = await getWorksiteIDFromUniqueCode(uniqueCode);

    if (!worksiteResponse.success || !worksiteResponse.data) {
      return {
        success: false,
        message: ERROR_MESSAGES.WORKSITE_AND_USER_IDS_NOT_FOUND
      };
    }

    const { worksiteId, userId } = worksiteResponse.data;

    let query = supabase
      .from('employee')
      .select(
        `
          *,
          assigned_equipments 
        `,
        {
          count: 'exact'
        }
      )
      .eq('user_id', userId);

    if (worksiteId) {
      query = query.eq('worksite_id', worksiteId);
    }

    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%`);
    }

    if (sortBy === 'name') {
      query = query.order('name', { ascending: sortOrder === 'asc' });
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      return {
        success: false,
        message: ERROR_MESSAGES.EMPLOYEE_NOT_FETCHED
      };
    }

    const employeesWithAssignedCount = data?.map(employee => ({
      ...employee,
      assigned_equipments: employee.assigned_equipments || 0
    }));

    return {
      success: true,
      data: employeesWithAssignedCount,
      message: SUCCESS_MESSAGES.EMPLOYEE_FETCHED,
      pageCount: count ? Math.ceil(count / pageSize) : 1
    };
  } catch (err) {
    console.error('Error fetching employees:', err);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const fetchEmployeePPEHistoryPUser = async (
  uniqueCode: string
): Promise<{
  success: boolean;
  message: string;
  data?: EmployeePPEHistoryType[];
  productNames?: string[];
}> => {
  const supabase = await createClient();

  try {
    const worksiteResponse = await getWorksiteIDFromUniqueCode(uniqueCode);

    if (!worksiteResponse.success || !worksiteResponse.data) {
      return {
        success: false,
        message: ERROR_MESSAGES.WORKSITE_AND_USER_IDS_NOT_FOUND
      };
    }

    const { worksiteId } = worksiteResponse.data;

    const { data: employeeData, error: employeeError } = await supabase
      .from('employee')
      .select('id, name, assigned_equipments')
      .eq('worksite_id', worksiteId);

    if (employeeError || !employeeData || employeeData.length === 0) {
      return {
        success: false,
        message: ERROR_MESSAGES.EMPLOYEE_NOT_FOUND
      };
    }

    const employeeIds = employeeData.map(employee => employee.id);

    const { data: equipmentData, error: equipmentError } = await supabase
      .from('product_history')
      .select(
        'assigned_date, unassigned_date, employee_id, product_inventory(product_name)'
      )
      .in('employee_id', employeeIds);

    if (equipmentError) {
      return {
        success: false,
        message: ERROR_MESSAGES.INVENTORY_NOT_FETCHED
      };
    }

    const productNames = Array.from(
      new Set(
        equipmentData
          .map(item => item.product_inventory?.product_name)
          .filter((name): name is string => !!name)
      )
    );

    const equipmentDetails: EmployeePPEHistoryType[] = employeeData.map(
      employee => {
        const status: Record<
          string,
          { state: 'Assigned' | 'Not Assigned'; date?: string }
        > = {};

        productNames.forEach(productName => {
          const equipment = equipmentData.find(
            equip =>
              equip.employee_id === employee.id &&
              equip.product_inventory?.product_name === productName
          );

          status[productName] = equipment
            ? {
                state: equipment.unassigned_date ? 'Not Assigned' : 'Assigned',
                date: equipment.unassigned_date
                  ? undefined
                  : equipment.assigned_date
              }
            : { state: 'Not Assigned' };
        });

        return {
          employeeId: employee.id,
          employeeName: employee.name,
          status,
          assignedDate: '',
          unassignedDate: null
        };
      }
    );

    return {
      success: true,
      message: SUCCESS_MESSAGES.EMPLOYEE_FETCHED,
      data: equipmentDetails,
      productNames
    };
  } catch (error) {
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const fetchInTransitProductsPUser = async (uniqueCode: string) => {
  const supabase = await createClient();

  try {
    const worksiteResponse = await getWorksiteIDFromUniqueCode(uniqueCode);

    if (!worksiteResponse.success || !worksiteResponse.data) {
      return {
        success: false,
        message: ERROR_MESSAGES.WORKSITE_AND_USER_IDS_NOT_FOUND
      };
    }

    const { worksiteId, userId } = worksiteResponse.data;

    const { data, error } = await supabase
      .from('order')
      .select(
        `order_items (
          quantity,
          product(
            id,
            ppe_name
          )
        ),
        worksite_id`
      )
      .eq('worksite_id', worksiteId)
      .neq('order_status', 'Delivered')
      .neq('order_status', 'Complaint')
      .eq('user_id', userId);

    if (error) {
      console.error('Error while fetching in-transit ordered products', error);
      return {
        success: false,
        message: ERROR_MESSAGES.IN_TRANSIT_ITEMS_FETCH_FAILED
      };
    }

    const inTransitData =
      data
        ?.flatMap(item => item.order_items)
        .filter(orderItem => orderItem?.product?.id)
        .map(orderItem => ({
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
    console.error('Error while fetching ordered products', error);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};
