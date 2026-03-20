'use server';

import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/constants';
import { WorksiteWithAddressType } from '@/types/index.types';
import { createClient } from '@/utils/supabase/server';
import { getUserIdFromAuth } from '../user';
import { revalidatePath } from 'next/cache';
import { generateWorksiteUniqueCode } from '..';
import { AddWorksiteType, UpdateWorksiteType } from '@/types/worksite.types';

// Add new workSite
export const addWorkSite = async (worksite: AddWorksiteType) => {
  const supabase = await createClient();

  try {
    const userId = await getUserIdFromAuth();
    if (!userId) {
      return {
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND
      };
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`first_name,last_name`)
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return {
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND
      };
    }

    const { first_name, last_name } = userData;

    const uniqueCode = await generateWorksiteUniqueCode(
      first_name,
      last_name,
      worksite.site_name
    );

    const worksiteDetails = {
      site_name: worksite.site_name,
      email: worksite.email,
      contact_number: worksite.contact_number,
      site_manager: worksite.site_manager,
      unique_code: uniqueCode,
      user_id: userId
    };

    const { data: worksiteData, error: worksiteError } = await supabase
      .from('worksite')
      .insert(worksiteDetails)
      .select('id')
      .single();

    if (worksiteError) {
      console.error('Error while adding the worksite', worksiteError);
      return {
        success: false,
        message: worksiteError.message || ERROR_MESSAGES.WORKSITE_NOT_ADDED
      };
    }

    const worksiteId = worksiteData.id;

    const addressDetails = {
      worksite_id: worksiteId,
      street1: worksite.address1,
      street2: worksite.address2,
      state: worksite.state,
      city: worksite.city,
      country: worksite.country,
      locality: worksite.locality,
      zipcode: worksite.zipcode
    };

    const { error: addressError } = await supabase
      .from('address')
      .insert(addressDetails);

    if (addressError) {
      console.error('Error while adding the address', addressError);
      return {
        success: false,
        message: ERROR_MESSAGES.ADDRESS_NOT_ADDED
      };
    }

    revalidatePath('/contractor');
    revalidatePath('/cart', 'page');

    return {
      success: true,
      message: SUCCESS_MESSAGES.WORKSITE_ADDED
    };
  } catch (err) {
    console.error('Unexpected error occurred while adding worksite:', err);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

// Get all worksites
export const getAllWorkSites = async (
  searchQuery?: string,
  sortBy?: string,
  sortOrder?: string,
  page: number = 1,
  pageSize: number = 10
): Promise<{
  success: boolean;
  message: string;
  data?: WorksiteWithAddressType[];
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
      .from('worksite')
      .select(
        `
        *,
        address(*)
      `,
        { count: 'exact' }
      )
      .eq('user_id', userId);

    if (searchQuery) {
      query = query.or(`site_name.ilike.%${searchQuery}%`);
    }

    if (sortBy === 'site_name') {
      query = query.order('site_name', { ascending: sortOrder === 'asc' });
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error: fetchError, count } = await query;

    if (fetchError) {
      return {
        success: false,
        message: fetchError.message || ERROR_MESSAGES.WORKSITE_NOT_FETCHED
      };
    }

    return {
      success: true,
      data: data as WorksiteWithAddressType[],
      message: SUCCESS_MESSAGES.WORKSITE_FETCHED,
      pageCount: count ? Math.ceil(count / pageSize) : 1
    };
  } catch (err) {
    console.error('Unexpected error occurred while fetching worksite:', err);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const getWorksiteOptions = async (): Promise<
  { value: string; label: string }[]
> => {
  const supabase = await createClient();
  try {
    const userId = await getUserIdFromAuth();

    if (!userId) {
      return [];
    }

    const { data: worksiteData, error: fetchError } = await supabase
      .from('worksite')
      .select('id, site_name')
      .eq('user_id', userId);

    if (fetchError || !worksiteData) {
      return [];
    }

    const worksiteOptions = worksiteData.map(worksite => ({
      label: worksite.site_name,
      value: worksite.id.toString()
    }));

    return worksiteOptions;
  } catch (err) {
    console.error('Error fetching worksites:', err);
    return [];
  }
};

export type WorksiteAddressType = {
  street1: string;
  street2: string | null;
  locality: string | null;
  city: string;
  state: string;
  country: string;
  zipcode: string;
};

export const getWorksiteWithAddressOptions = async (): Promise<
  {
    value: string;
    label: string;
    address: WorksiteAddressType;
    worksite_id: string;
  }[]
> => {
  const supabase = await createClient();
  try {
    const userId = await getUserIdFromAuth();

    if (!userId) {
      return [];
    }

    const { data: worksiteData, error: fetchError } = await supabase
      .from('worksite')
      .select(
        'id, site_name, address(id,street1, street2, locality, city, state, country, zipcode)'
      )
      .eq('user_id', userId);

    if (fetchError || !worksiteData) {
      return [];
    }

    const worksiteOptions = worksiteData?.map(worksite => {
      return {
        label: worksite.site_name,
        value: worksite.address[0].id.toString(),
        address: {
          street1: worksite.address[0].street1,
          street2: worksite.address[0].street2,
          locality: worksite.address[0].locality,
          city: worksite.address[0].city,
          state: worksite.address[0].state,
          country: worksite.address[0].country,
          zipcode: worksite.address[0].zipcode
        },
        worksite_id: worksite.id
      };
    });

    return worksiteOptions;
  } catch (err) {
    console.error('Error fetching worksites:', err);
    return [];
  }
};

// Delete a worksite
export const deleteWorksite = async (
  worksiteId: string
): Promise<{ success: boolean; message: string }> => {
  const supabase = await createClient();

  try {
    const userId = await getUserIdFromAuth();

    if (!userId) {
      return {
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND
      };
    }

    const { data: worksiteData, error: worksiteError } = await supabase
      .from('worksite')
      .select('id')
      .eq('id', worksiteId)
      .eq('user_id', userId)
      .single();

    if (worksiteError || !worksiteData) {
      return {
        success: false,
        message: ERROR_MESSAGES.WORKSITE_NOT_FOUND
      };
    }

    const { error: deleteWorksiteError } = await supabase
      .from('worksite')
      .delete()
      .eq('id', worksiteId);

    if (deleteWorksiteError) {
      console.error('Error while deleting the worksite', deleteWorksiteError);
      return {
        success: false,
        message: ERROR_MESSAGES.WORKSITE_NOT_DELETED
      };
    }

    const { error: deleteAddressError } = await supabase
      .from('address')
      .delete()
      .eq('worksite_id', worksiteId);

    if (deleteAddressError) {
      console.error('Error while deleting the address', deleteAddressError);
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.WORKSITE_DELETED
    };
  } catch (err) {
    console.error('Unexpected error occurred while deleting worksite:', err);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

// Update a worksite
export const updateWorkSite = async (
  worksiteData: UpdateWorksiteType,
  worksiteId: string
) => {
  const supabase = await createClient();

  try {
    const userId = await getUserIdFromAuth();
    if (!userId) {
      return {
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND
      };
    }

    const { data: existingWorksite, error: existingWorksiteError } =
      await supabase
        .from('worksite')
        .select('user_id')
        .eq('id', worksiteId)
        .single();

    if (existingWorksiteError || existingWorksite?.user_id !== userId) {
      return {
        success: false,
        message: ERROR_MESSAGES.WORKSITE_NOT_FOUND
      };
    }

    const worksiteDetails = {
      site_name: worksiteData.site_name,
      email: worksiteData.email,
      contact_number: worksiteData.contact_number,
      site_manager: worksiteData.site_manager
    };

    const { error: worksiteError } = await supabase
      .from('worksite')
      .update(worksiteDetails)
      .eq('id', worksiteId);

    if (worksiteError) {
      console.error('Error while updating the worksite', worksiteError);
      return {
        success: false,
        message: worksiteError.message || ERROR_MESSAGES.WORKSITE_NOT_UPDATED
      };
    }

    const addressDetails = {
      street1: worksiteData.address1,
      street2: worksiteData.address2,
      state: worksiteData.state,
      city: worksiteData.city,
      country: worksiteData.country,
      locality: worksiteData.locality,
      zipcode: worksiteData.zipcode
    };

    const { error: addressError } = await supabase
      .from('address')
      .update(addressDetails)
      .eq('worksite_id', worksiteId);

    if (addressError) {
      console.error('Error while updating the address', addressError);
      return {
        success: false,
        message: ERROR_MESSAGES.ADDRESS_NOT_UPDATED
      };
    }

    revalidatePath('/contractor/worksite');

    return {
      success: true,
      message: SUCCESS_MESSAGES.WORKSITE_UPDATED
    };
  } catch (err) {
    console.error('Unexpected error occurred while updating worksite:', err);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};
