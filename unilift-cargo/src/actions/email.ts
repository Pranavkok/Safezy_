'use server';

import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  USER_ROLES
} from '@/constants/constants';
import { OrderDetailsForAdmin } from '@/types/order.types';
import { createAdminClient, createClient } from '@/utils/supabase/server';
import { signupWarehouseEmailHTML } from '@/data/signupWarehouseEmail';
import { orderConfirmationEmailHTML } from '@/data/orderConfirmationEmail';
import { customerSuccessSignupEmailHTML } from '@/data/customerSuccessSignupEmail';
import { contactedEmailToAdminHTML } from '@/data/contactedEmailToAdmin';
import { orderConfirmationEmailToAdminHTML } from '@/data/ordreConfirmationEmailToAdmin';
import { blogSubscribedEmailHTML } from '@/data/blogSubscribedEmail';
import { newBlogHTML } from '@/data/blogNotificationEmail';
import { chunkArray } from '@/utils/EmailBatch';

export const sendOrderConfirmation = async (
  orderId: string,
  warehouseOperatorEmail: string
) => {
  if (!orderId) {
    return { success: false, message: ERROR_MESSAGES.ORDER_ID_REQUIRED };
  }

  if (!warehouseOperatorEmail) {
    return { success: false, message: ERROR_MESSAGES.WAREHOUSE_NOT_FETCHED };
  }

  const emailData = {
    to: warehouseOperatorEmail,
    subject: 'Safezy | Order confirmation email',
    context: {
      orderId: orderId
    }
  };

  try {
    const supabase = await createClient();
    const url = process.env.ORDER_DETAILS_URL;

    const payload = {
      to: warehouseOperatorEmail,
      subject: 'Safezy | Order confirmation email',
      html: orderConfirmationEmailHTML(
        {
          orderId: orderId
        },
        url!
      )
    };

    await supabase.functions.invoke('send-email', {
      body: payload
    });

    return { success: true, message: SUCCESS_MESSAGES.EMAIL_SENT, emailData };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, message: ERROR_MESSAGES.EMAIL_NOT_SENT };
  }
};

export const sendSignupWarehouse = async (userEmail: string) => {
  try {
    const supabase = await createClient();
    const subject = 'Safezy | Warehouse Signup Invitation';

    const signupUrl = process.env.SIGNUP_WAREHOUSE_URL;

    const payload = {
      to: userEmail,
      subject,
      html: signupWarehouseEmailHTML(signupUrl!)
    };

    await supabase.functions.invoke('send-email', {
      body: payload
    });

    return {
      success: true,
      message: SUCCESS_MESSAGES.SIGNUP_WAREHOUSE
    };
  } catch (error) {
    console.error('Error in sendSignupWarehouse:', error);
    return {
      success: false,
      message: ERROR_MESSAGES.SIGNUP_WAREHOUSE_ERROR
    };
  }
};

export const sendSignupSuccessful = async (
  userEmail: string,
  first_name: string,
  last_name: string
) => {
  try {
    const supabase = await createClient();
    const subject = 'Safezy | Signup Successful Notification';

    const payload = {
      to: userEmail,
      subject,
      html: customerSuccessSignupEmailHTML({ first_name, last_name })
    };

    await supabase.functions.invoke('send-email', {
      body: payload
    });

    return {
      success: true,
      message: SUCCESS_MESSAGES.SIGNUP_SUCCESS_EMAIL
    };
  } catch (error) {
    console.error('Error in sendSignupSuccessful:', error);
    return {
      success: false,
      message: ERROR_MESSAGES.SIGNUP_SUCCESS_EMAIL_ERROR
    };
  }
};

export const sendContactedSafezyEmail = async (
  first_name: string,
  last_name: string,
  company_name: string,
  email: string,
  contact_number: string,
  requirements: string
) => {
  try {
    const supabase = await createClient();
    const subject = 'Safezy | Support Request Notification';

    const payload = {
      to: [
        'rahulkumar.ojha@safezy.in',
        'ravi.sharma@safezy.in',
        'pranay.aggarwal@safezy.in',
        'sales.commercial@uniliftcargo.com',
        'ashish.pawar@uniliftcargo.com'
      ],
      subject,
      html: contactedEmailToAdminHTML({
        first_name,
        last_name,
        company_name,
        email,
        contact_number,
        requirements
      })
    };

    await supabase.functions.invoke('send-email', {
      body: payload
    });

    return {
      success: true,
      message: SUCCESS_MESSAGES.SIGNUP_SUCCESS_EMAIL
    };
  } catch (error) {
    console.error('Error in sendSignupSuccessful:', error);
    return {
      success: false,
      message: ERROR_MESSAGES.CONTACT_EMAIL_ERROR
    };
  }
};

export const sendOrderDetailsToAdmin = async (order: OrderDetailsForAdmin) => {
  const supabase = await createAdminClient();

  try {
    const subject = 'Safezy | Order Received Notification';

    const payload = {
      to: [
        'rahulkumar.ojha@safezy.in',
        'ravi.sharma@safezy.in',
        'pranay.aggarwal@safezy.in',
        'sales.commercial@uniliftcargo.com',
        'ashish.pawar@uniliftcargo.com'
      ],
      subject,
      html: orderConfirmationEmailToAdminHTML({ orderDetails: order })
    };

    await supabase.functions.invoke('send-email', { body: payload });

    const { error } = await supabase
      .from('order')
      .update({ is_email_sent: true })
      .eq('id', order.id);

    if (error) {
      console.error('Error while updating', error);
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.ORDER_EMAIL_SENT
    };
  } catch (error) {
    console.error('Error in sendSignupSuccessful:', error);
    return {
      success: false,
      message: ERROR_MESSAGES.ORDER_EMAIL_SEND_EMAIL
    };
  }
};

export const sendBlogSubscribedEmail = async (
  subscriberEmail: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const supabase = await createClient();
    const subject = `Safezy | Subscription Confirmation`;

    const payload = {
      to: subscriberEmail,
      subject,
      html: blogSubscribedEmailHTML()
    };

    await supabase.functions.invoke('send-email', {
      body: payload
    });

    return {
      success: true,
      message: SUCCESS_MESSAGES.BLOG_SUBSCRIPTION_SUCCESS_EMAIL
    };
  } catch (error) {
    console.error('Error in sendBlogSubscribedEmail:', error);
    return {
      success: false,
      message: ERROR_MESSAGES.BLOG_SUBSCRIPTION_SUCCESS_EMAIL_ERROR
    };
  }
};

export const sendNewBlogEmail = async (
  blogId: number,
  blogTitle: string,
  blogImageUrl?: string | null
): Promise<{ success: boolean; message: string }> => {
  try {
    const supabase = await createClient();

    const { data: subscribers, error: subscribersError } = await supabase
      .from('blog_subscribers')
      .select('subscriber_email');

    if (subscribersError) {
      console.error(
        'Error while fetching blog subscribers details',
        subscribersError
      );
      return {
        success: false,
        message: ERROR_MESSAGES.SUBSCRIBER_DETAILS_NOT_FETCHED
      };
    }

    const { data: contractorUsers, error: contractorsError } = await supabase
      .from('users')
      .select('email, is_active, user_roles!inner(role)')
      .eq('user_roles.role', USER_ROLES.CONTRACTOR)
      .eq('is_active', true);

    if (contractorsError) {
      console.error('Error while fetching contractor users', contractorsError);
      return {
        success: false,
        message: ERROR_MESSAGES.CONTRACTOR_USERS_NOT_FETCHED
      };
    }

    const subscriberEmails =
      subscribers?.map(sub => sub.subscriber_email) || [];

    const contractorEmails = (
      contractorUsers?.map(user => user.email) || []
    ).filter((email): email is string => Boolean(email));

    const emails = Array.from(
      new Set([...subscriberEmails, ...contractorEmails])
    );

    if (emails.length === 0) {
      console.error('No subscribers or contractors found to send email');
      return {
        success: false,
        message: ERROR_MESSAGES.SUBSCRIBER_CONTRACTOR_NOT_FOUND
      };
    }

    const emailChunks = chunkArray(emails, 100);

    for (const chunk of emailChunks) {
      await supabase.functions.invoke('send-email', {
        body: {
          to: chunk,
          subject: `Safezy | New Blog: "${blogTitle}"`,
          html: newBlogHTML({
            blog_id: blogId,
            blog_title: blogTitle,
            blog_image_url: blogImageUrl
          })
        }
      });
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.BLOG_NOTIFICATION_SUCCESS_EMAIL
    };
  } catch (error) {
    console.error('Error in sendBlogNotificationEmail:', error);
    return {
      success: false,
      message: ERROR_MESSAGES.BLOG_NOTIFICATION_SUCCESS_EMAIL_ERROR
    };
  }
};
