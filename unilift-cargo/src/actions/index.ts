'use server';

import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  USER_ROLES
} from '@/constants/constants';
import { WorksiteIDFromUniqueCodeType } from '@/types/principal.types';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';
import { generateRandomNumber } from './helper';

export const deactivateUser = async (
  userId: string,
  userRole: string = USER_ROLES.CONTRACTOR
) => {
  const supabase = await createClient();

  const { error } = await supabase
    .from('users')
    .update({ is_active: false })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user status:', error);
    return {
      success: false,
      message: ERROR_MESSAGES.USER_STATUS_NOT_UPDATED
    };
  }

  revalidatePath('/admin/contractors');

  let successMessage = '';
  if (userRole === USER_ROLES.CONTRACTOR) {
    successMessage = SUCCESS_MESSAGES.CONTRACTOR_DEACTIVATED;
  } else if (userRole === USER_ROLES.WAREHOUSE_OPERATOR) {
    successMessage = SUCCESS_MESSAGES.WAREHOUSE_DEACTIVATED;
  }

  return {
    success: true,
    message: successMessage
  };
};

export const activateUser = async (
  userId: string,
  userRole: string = USER_ROLES.CONTRACTOR
) => {
  const supabase = await createClient();

  const { error } = await supabase
    .from('users')
    .update({ is_active: true })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user status:', error);
    return {
      success: false,
      message: ERROR_MESSAGES.USER_STATUS_NOT_UPDATED
    };
  }

  revalidatePath('/admin/contractors');

  let successMessage = '';
  if (userRole === USER_ROLES.CONTRACTOR) {
    successMessage = SUCCESS_MESSAGES.CONTRACTOR_ACTIVATED;
  } else if (userRole === USER_ROLES.WAREHOUSE_OPERATOR) {
    successMessage = SUCCESS_MESSAGES.WAREHOUSE_ACTIVATED;
  }

  return {
    success: true,
    message: successMessage
  };
};

export const generateUniqueCode = async (
  firstName: string,
  lastName: string,
  contactNumber: string,
  companyName: string
): Promise<string> => {
  const supabase = await createClient();
  const generateCode = (): string => {
    const firstNameInitial = firstName.charAt(0).toLowerCase();
    const lastNameInitial = lastName.charAt(0).toLowerCase();
    const firstTwoDigits = contactNumber.slice(0, 2);
    const lastTwoDigits = contactNumber.slice(-2);
    const companyNamePart = companyName.slice(0, 4).toLowerCase();
    const randomNumber = generateRandomNumber();
    return `${firstNameInitial}${lastNameInitial}${firstTwoDigits}-${lastTwoDigits}${companyNamePart}-${randomNumber}`;
  };
  let uniqueCode;
  let data;
  do {
    uniqueCode = generateCode();
    const response = await supabase
      .from('users')
      .select('user_unique_code')
      .eq('user_unique_code', uniqueCode)
      .single();
    data = response.data;
  } while (data);
  return uniqueCode;
};

export const generateWorksiteUniqueCode = async (
  firstName: string,
  lastName: string,
  siteName: string
) => {
  const initials = `${firstName.charAt(0).toLowerCase()}${lastName.charAt(0).toLowerCase()}`;

  const normalizedWorksiteName = siteName.slice(0, 6).toLowerCase();

  const microUUID = uuidv4().slice(0, 8);
  const uniqueCode = `${initials}-${normalizedWorksiteName}-${microUUID}`;

  return uniqueCode;
};

export const getWorksiteIDFromUniqueCode = async (
  uniqueCode: string
): Promise<{
  success: boolean;
  message: string;
  data?: WorksiteIDFromUniqueCodeType;
}> => {
  const supabase = await createClient();
  try {
    const { data: worksiteData, error: worksiteError } = await supabase
      .from('worksite')
      .select('id, user_id')
      .eq('unique_code', uniqueCode)
      .single();

    if (worksiteError || !worksiteData) {
      console.error('Error fetching worksite data:', worksiteError);
      return {
        success: false,
        message: ERROR_MESSAGES.WORKSITE_NOT_FOUND
      };
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.WORKSITE_FETCHED,
      data: {
        worksiteId: worksiteData.id,
        userId: worksiteData.user_id as string
      }
    };
  } catch (error) {
    console.error('Unexpected error fetching worksite data:', error);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};
