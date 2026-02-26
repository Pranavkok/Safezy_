'use server';

import { createClient } from '@/utils/supabase/server';
import { SignUpType } from '@/types/auth.types';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/constants';
import { generateUniqueCode } from '..';
import { UpdateProfileType } from '@/types/contractor/profile';
import { revalidatePath } from 'next/cache';
import { getAuthId } from '../user';
import { ContractorType } from '@/types/index.types';

// [#] Add new contractor details
export const addContractorDetails = async (
  userDetails: SignUpType,
  authId: string,
  roleId: number
): Promise<{ success: boolean; message: string }> => {
  const uniqueCode: string = await generateUniqueCode(
    userDetails.fName,
    userDetails.lName,
    userDetails.contactNumber,
    userDetails.cName
  );

  const contractorDetails = {
    first_name: userDetails.fName,
    last_name: userDetails.lName,
    contact_number: userDetails.contactNumber,
    email: userDetails.email,
    total_workers: userDetails.noOfWorkers,
    company_name: userDetails.cName,
    locations_served: userDetails.locations,
    companies_served: userDetails.companies,
    industries_type: userDetails.industriesServed,
    service_type: userDetails.typeOfServicesProvided,
    other_industries_type: userDetails.industriesServedOther,
    other_services_type: userDetails.typeOfServicesProvidedOther,
    geographical_location: userDetails.geographicalLocation,
    auth_id: authId,
    role_id: roleId,
    user_unique_code: uniqueCode
  };

  const supabase = await createClient();

  try {
    const { error } = await supabase.from('users').insert(contractorDetails);

    if (error) {
      console.error('Error inserting contractor details:', error);
      return { success: false, message: ERROR_MESSAGES.CONTRACTOR_NOT_FETCHED };
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.CONTRACTOR_DETAILS_ADDED
    };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, message: ERROR_MESSAGES.CONTRACTOR_NOT_ADDED };
  }
};

// [#] Update existing contractor details
export const updateContractorDetails = async (
  userId: string,
  contractorDetails: UpdateProfileType
): Promise<{ success: boolean; message: string }> => {
  const supabase = await createClient();

  try {
    const updateProfile = {
      first_name: contractorDetails.fName,
      last_name: contractorDetails.lName,
      contact_number: contractorDetails.contactNumber,
      total_workers: contractorDetails.noOfWorkers,
      company_name: contractorDetails.cName,
      companies_served: contractorDetails.companies,
      locations_served: contractorDetails.locations,
      industries_type: contractorDetails.industriesServed,
      service_type: contractorDetails.typeOfServicesProvided,
      geographical_location: contractorDetails.geographicalLocation,
      other_industries_type: contractorDetails.industriesServedOther,
      other_services_type: contractorDetails.typeOfServicesProvidedOther
    };

    const { error } = await supabase
      .from('users')
      .update(updateProfile)
      .eq('id', userId);

    if (error) {
      console.error('Error updating contractor details:', error);
      return { success: false, message: ERROR_MESSAGES.CONTRACTOR_NOT_UPDATED };
    }

    revalidatePath('/contractor');

    return {
      success: true,
      message: SUCCESS_MESSAGES.CONTRACTOR_DETAILS_UPDATED
    };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, message: ERROR_MESSAGES.CONTRACTOR_NOT_UPDATED };
  }
};

// [#] fetch authenticated contractor details
export const fetchContractorsDetails = async (): Promise<{
  success: boolean;
  message: string;
  data?: ContractorType;
}> => {
  const supabase = await createClient();

  try {
    const authId = await getAuthId();

    if (!authId) {
      return {
        success: false,
        message: ERROR_MESSAGES.CONTRACTOR_NOT_FETCHED
      };
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authId)
      .single();

    if (error) {
      console.error('Error fetching contractor details:', error);
      return { success: false, message: ERROR_MESSAGES.CONTRACTOR_NOT_FETCHED };
    }

    return {
      data,
      success: true,
      message: SUCCESS_MESSAGES.CONTRACTOR_DETAILS_FETCHED
    };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, message: ERROR_MESSAGES.CONTRACTOR_NOT_FETCHED };
  }
};

export const deleteContractor = async (
  contractorId: string
): Promise<{ success: boolean; message: string }> => {
  const supabase = await createClient();

  try {
    const { error: UpdateError } = await supabase
      .from('users')
      .update({
        is_active: false,
        is_deleted: true
      })
      .eq('id', contractorId);

    if (UpdateError) {
      console.error('Error updating contractor status:', UpdateError);
      return {
        success: false,
        message: ERROR_MESSAGES.USER_NOT_DEACTIVATED
      };
    }

    revalidatePath('/contractor/profile');

    return {
      success: true,
      message: ERROR_MESSAGES.USER_DEACTIVATED
    };
  } catch (error) {
    console.error(
      'An unexpected error occured while deleting the contractor',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};
