'use server';

import { createClient } from '@/utils/supabase/server';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/constants';
import { ComplaintFormType } from '@/validations/complaint/complaint';
import { sendComplaintEmail } from '@/actions/email';

export const submitComplaint = async (
  data: ComplaintFormType
): Promise<{ success: boolean; message: string }> => {
  const supabase = await createClient();

  try {
    const { name, email, subject, message } = data;

    const nameParts = name.trim().split(' ');
    const first_name = nameParts[0];
    const last_name = nameParts.slice(1).join(' ') || '-';

    const { error } = await supabase.from('contact').insert([
      {
        first_name,
        last_name,
        email,
        requirements: `[COMPLAINT] Subject: ${subject}\n\nMessage: ${message}`
      }
    ]);

    if (error) {
      console.error('Error while inserting complaint:', error);
      return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
    }

    await sendComplaintEmail(name, email, subject, message);

    return { success: true, message: 'Your complaint has been submitted successfully.' };
  } catch (err) {
    console.error('Error submitting complaint:', err);
    return { success: false, message: ERROR_MESSAGES.UNEXPECTED_ERROR };
  }
};
