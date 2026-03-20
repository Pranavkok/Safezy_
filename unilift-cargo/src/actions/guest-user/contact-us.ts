'use server';

import { createClient } from '@/utils/supabase/server';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/constants';
import { ContactUsType } from '@/types/contact.types';

export const addContactUsDetails = async (
  ContactDetails: ContactUsType
): Promise<{ success: boolean; message: string }> => {
  const supabase = await createClient();

  try {
    const {
      cName: company_name,
      email,
      fName: first_name,
      lName: last_name,
      phoneNumber: contact_number,
      requirement: requirements
    } = ContactDetails;

    if (
      !company_name ||
      !email ||
      !first_name ||
      !last_name ||
      !contact_number ||
      !requirements
    ) {
      return {
        success: false,
        message: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS
      };
    }

    const { error } = await supabase.from('contact').insert([
      {
        company_name,
        email,
        first_name,
        last_name,
        contact_number,
        requirements
      }
    ]);

    if (error) {
      console.error('Error while inserting contact details:', error);
      return {
        success: false,
        message: ERROR_MESSAGES.CONTACT_NOT_ADDED
      };
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.CONTACT_ADDED
    };
  } catch (err) {
    console.error('Error clearing cart:', err.message);
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export default addContactUsDetails;
