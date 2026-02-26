'use server';

import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/constants';
import {
  AddEmployeeType,
  EmployeeEquipmentHistory,
  EmployeePPEHistoryType,
  UpdateEmployeeType
} from '@/types/employee.types';
import { EmployeeType } from '@/types/index.types';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { getUserIdFromAuth } from '../user';

// Fetch all employees along with their workSite details
export const getEmployee = async (
  worksiteId: string | undefined,
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
    const userId = await getUserIdFromAuth();

    if (!userId) {
      return {
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND
      };
    }

    let query = supabase
      .from('employee')
      .select(
        `
          *,
          worksite:worksite_id ( site_name ),
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
      query = query.or(
        `name.ilike.%${searchQuery}%,department.ilike.%${searchQuery}%,plant.ilike.%${searchQuery}%`
      );
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

// [#] Add employee manually with workSite as a foreign key
export const addEmployee = async (employeeData: AddEmployeeType) => {
  const supabase = await createClient();

  try {
    const userId = await getUserIdFromAuth();

    if (!userId) {
      return {
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND
      };
    }

    const { data, error } = await supabase.from('employee').insert({
      name: employeeData.name,
      contact_number: employeeData.contact_number || '',
      user_id: userId,
      worksite_id: employeeData.site_name,
      designation: employeeData.designation,
      department: employeeData.department,
      plant: employeeData.plant
    });

    if (error) {
      return {
        success: false,
        message: ERROR_MESSAGES.EMPLOYEE_NOT_ADDED
      };
    }

    revalidatePath('/contractor');

    return {
      success: true,
      data,
      message: SUCCESS_MESSAGES.EMPLOYEE_ADDED
    };
  } catch (err) {
    console.error('Error adding employee:', err);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

// [#] Update details of an existing employee
export const updateEmployee = async (
  employeeData: UpdateEmployeeType,
  id: number
) => {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from('employee')
      .update({
        name: employeeData.name,
        contact_number: employeeData.contact_number,
        designation: employeeData.designation,
        worksite_id: employeeData.site_name,
        department: employeeData.department,
        plant: employeeData.plant
      })
      .eq('id', id);

    if (error) {
      return {
        success: false,
        message: ERROR_MESSAGES.EMPLOYEE_NOT_UPDATED
      };
    }

    revalidatePath('/contractor');

    return {
      success: true,
      message: SUCCESS_MESSAGES.EMPLOYEE_UPDATED
    };
  } catch (err) {
    console.error(`Error updating employee with ID ${id}:`, err);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

// [#] Delete an employee
export const deleteEmployee = async (employeeId: number) => {
  const supabase = await createClient();

  try {
    const { error: historyDeleteError } = await supabase
      .from('product_history')
      .delete()
      .eq('employee_id', employeeId);

    if (historyDeleteError) {
      console.error(
        `Error deleting employee history for employee ${employeeId}:`,
        historyDeleteError
      );
      return {
        success: false,
        message: ERROR_MESSAGES.EMPLOYEE_NOT_DELETED
      };
    }

    // Delete the employee record
    const { data, error } = await supabase
      .from('employee')
      .delete()
      .eq('id', employeeId)
      .single();

    if (error) {
      console.error(`Error deleting employee with ID ${employeeId}:`, error);
      return {
        success: false,
        message: ERROR_MESSAGES.EMPLOYEE_NOT_DELETED
      };
    }

    // Revalidate the path to refresh server-side data
    revalidatePath('/contractor');

    return {
      success: true,
      data,
      message: SUCCESS_MESSAGES.EMPLOYEE_DELETED
    };
  } catch (err) {
    console.error(
      `Unexpected error deleting employee with ID ${employeeId}:`,
      err
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

// Add Employee From csv file
export const addEmployeesFromCSV = async (
  csvData: Array<{
    name: string;
    contact_number: string;
    designation: string;
    department: string;
    plant: string;
  }>,
  worksite_id: string
) => {
  try {
    const supabase = await createClient();
    const user_id = await getUserIdFromAuth();

    if (!user_id) {
      return {
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND
      };
    }

    const validatedEmployees = csvData
      .filter(employee => {
        if (!employee.name || typeof employee.name !== 'string') {
          console.error(`Invalid name: ${employee.name}`);
          return false;
        }

        if (!/^\d{10}$/.test(employee.contact_number)) {
          console.error(`Invalid contact number: ${employee.contact_number}`);
          return false;
        }

        if (
          !employee.designation ||
          typeof employee.designation !== 'string' ||
          !employee.department ||
          typeof employee.department !== 'string'
        ) {
          console.error(
            `Invalid fields for employee: ${JSON.stringify(employee)}`
          );
          return false;
        }

        if (!employee.plant || !/^[a-zA-Z0-9\s]+$/.test(employee.plant)) {
          console.error(`Invalid plant: ${employee.plant}`);
          return false;
        }

        return true;
      })
      .map(employee => ({
        ...employee,
        user_id,
        worksite_id
      }));

    if (validatedEmployees.length === 0) {
      return {
        success: false,
        message: ERROR_MESSAGES.DATA_NOT_FOUND
      };
    }

    const { error } = await supabase
      .from('employee')
      .insert(validatedEmployees);

    if (error) {
      return {
        success: false,
        message: error.message || ERROR_MESSAGES.FAILED_ADDING_CSV_DATA
      };
    }

    revalidatePath('/contractor');

    return {
      success: true,
      message: SUCCESS_MESSAGES.CSV_DATA_ADDED
    };
  } catch (error) {
    console.error('Error adding employees from CSV:', error);
    return {
      success: false,
      message: error.message || ERROR_MESSAGES.FAILED_ADDING_CSV_DATA
    };
  }
};

// [#] Fetch employee equipment history
export const fetchEmployeeHistory = async (
  employeeId: number
): Promise<{
  success: boolean;
  message: string;
  data?: EmployeeEquipmentHistory[];
}> => {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('product_history')
      .select(
        `
          id,
          assigned_date,
          unassigned_date,
          quantity,
          product_inventory (
            product_name,
            product (
              use_life
            )
          )
        `
      )
      .eq('employee_id', employeeId)
      .is('unassigned_date', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch employee history', error.message);
      return {
        success: false,
        message: ERROR_MESSAGES.EMPLOYEE_HISTORY_NOT_FETCHED
      };
    }

    const formattedData: EmployeeEquipmentHistory[] =
      data?.map(record => {
        const assignedDate = new Date(record.assigned_date);
        const useLifeInMonths: number =
          record.product_inventory?.product?.use_life || 0;

        const expirationDate = new Date(assignedDate);
        expirationDate.setMonth(expirationDate.getMonth() + useLifeInMonths);

        const renewalDate = new Date(expirationDate);
        renewalDate.setDate(renewalDate.getDate() + 1);

        const currentDate = new Date();
        const timeDifference = expirationDate.getTime() - currentDate.getTime();
        const remainingLife = Math.max(
          0,
          Math.ceil(timeDifference / (1000 * 60 * 60 * 24))
        );

        return {
          id: record.id,
          assigned_date: record.assigned_date,
          unassigned_date: record.unassigned_date,
          quantity: record.quantity,
          product_name: record.product_inventory?.product_name || '',
          expiration_date: expirationDate.toISOString().split('T')[0],
          renewal_date: renewalDate.toISOString().split('T')[0],
          remaining_life: remainingLife
        };
      }) || [];

    return {
      success: true,
      message: SUCCESS_MESSAGES.EMPLOYEE_HISTORY_FETCHED,
      data: formattedData
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while fetching employee history',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const assignPPEToEmployee = async (
  employeeId: number,
  inventoryIds: string[]
): Promise<{ success: boolean; message: string }> => {
  const supabase = await createClient();

  try {
    const { data: inventoryData, error: fetchError } = await supabase
      .from('product_inventory')
      .select('id, product_quantity')
      .gt('product_quantity', 0)
      .in('id', inventoryIds);

    if (fetchError) {
      console.error('Error fetching product inventory:', fetchError);
      return {
        success: false,
        message: ERROR_MESSAGES.INVENTORY_NOT_FETCHED
      };
    }

    const insufficientProducts = inventoryData.filter(
      item => item.product_quantity! < 1
    );
    if (insufficientProducts.length > 0) {
      return {
        success: false,
        message: ERROR_MESSAGES.INSUFFICIENT_QUANTITY
      };
    }

    const productHistoryEntries = inventoryIds.map(inventoryId => ({
      employee_id: employeeId,
      inventory_id: inventoryId,
      quantity: 1,
      assigned_date: new Date().toISOString()
    }));

    const { error: insertError } = await supabase
      .from('product_history')
      .insert(productHistoryEntries);

    if (insertError) {
      console.error('Error inserting into product_history:', insertError);
      return {
        success: false,
        message: ERROR_MESSAGES.PPE_NOT_ASSIGNED
      };
    }

    const inventoryUpdates = inventoryIds.map(async inventoryId => {
      const { data: productData, error: productError } = await supabase
        .from('product_inventory')
        .select('product_quantity')
        .eq('id', inventoryId)
        .single();

      if (productError || !productData) {
        console.error('Error fetching product quantity:', productError);
        return null;
      }

      const currentQuantity = productData.product_quantity || 0;
      const newQuantity = currentQuantity - 1;

      const { error: updateError } = await supabase
        .from('product_inventory')
        .update({ product_quantity: newQuantity })
        .eq('id', inventoryId);

      if (updateError) {
        console.error('Error updating product_inventory:', updateError);
        return null;
      }

      return true;
    });

    const updateResults = await Promise.all(inventoryUpdates);
    const failedUpdates = updateResults.filter(res => res === null);

    if (failedUpdates.length > 0) {
      console.error(
        'Error updating product_inventory for some products:',
        failedUpdates
      );
      return {
        success: false,
        message: ERROR_MESSAGES.INVENTORY_NOT_UPDATED
      };
    }

    const { data: employeeData, error: employeeFetchError } = await supabase
      .from('employee')
      .select('assigned_equipments')
      .eq('id', employeeId)
      .single();

    if (employeeFetchError || !employeeData) {
      console.error('Error fetching employee data:', employeeFetchError);
      return {
        success: false,
        message: ERROR_MESSAGES.EMPLOYEE_NOT_FOUND
      };
    }

    const currentAssignedEquipments = employeeData.assigned_equipments || 0;
    const newAssignedEquipments =
      currentAssignedEquipments + inventoryIds.length;

    const { error: updateEmployeeError } = await supabase
      .from('employee')
      .update({ assigned_equipments: newAssignedEquipments })
      .eq('id', employeeId);

    if (updateEmployeeError) {
      console.error(
        'Error updating assigned_equipments for employee:',
        updateEmployeeError
      );
      return {
        success: false,
        message: ERROR_MESSAGES.PPE_NOT_ASSIGNED
      };
    }

    revalidatePath('/contractors');

    return {
      success: true,
      message: SUCCESS_MESSAGES.PPE_ASSIGNED
    };
  } catch (error) {
    console.error('Unexpected error while assigning PPE:', error);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const fetchEmployeePPEHistory = async (
  worksiteId: string,
  from?: string | undefined,
  to?: string | undefined
): Promise<{
  success: boolean;
  message: string;
  data?: EmployeePPEHistoryType[];
  productNames?: string[];
}> => {
  const supabase = await createClient();

  try {
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

    const query = supabase
      .from('product_history')
      .select(
        'assigned_date, unassigned_date, employee_id, product_inventory(product_name)'
      )
      .in('employee_id', employeeIds);

    const { data: equipmentData, error: equipmentError } = await query;

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

    const assignedEmployees = employeeData.filter(employee =>
      equipmentData.some(equip => {
        const assignedDate = new Date(equip.assigned_date)
          .toISOString()
          .split('T')[0];
        const fromDate = from
          ? new Date(from).toISOString().split('T')[0]
          : null;
        const toDate = to ? new Date(to).toISOString().split('T')[0] : null;

        return (
          equip.employee_id === employee.id &&
          equip.assigned_date &&
          (!fromDate || assignedDate >= fromDate) &&
          (!toDate || assignedDate <= toDate)
        );
      })
    );

    const equipmentDetails: EmployeePPEHistoryType[] = assignedEmployees.map(
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

          if (equipment) {
            status[productName] = {
              state: equipment.unassigned_date ? 'Not Assigned' : 'Assigned',
              date: equipment.unassigned_date
                ? undefined
                : equipment.assigned_date
            };
          }
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
      data: productNames.length === 0 ? [] : equipmentDetails,
      productNames
    };
  } catch (error) {
    console.error(
      'Unexpected error while fetching employee PPE history:',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};
