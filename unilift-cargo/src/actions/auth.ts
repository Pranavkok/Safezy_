'use server';

import {
  LoginType,
  PrincipalRegisterType,
  ResetPasswordType,
  SignUpType
} from '@/types/auth.types';
import { createClient } from '@/utils/supabase/server';
import { AppRoutes } from '@/constants/AppRoutes';
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  USER_ROLES
} from '@/constants/constants';
import { revalidatePath } from 'next/cache';
import { addWarehouseOperatorDetails } from './warehouse-operator/warehouse';
import { WarehouseOperatorSignUpType } from '@/sections/auth/SignUpWarehouseOperatorSection';
import { addPrincipalDetails } from '@/actions/principal-employer/principal';
import { addContractorDetails } from './contractor/contractor';
import { sendPushNotification } from '@/lib/web-push';

export const signUpUser = async (
  userDetails: SignUpType
): Promise<{ success: boolean; message: string; redirectPath?: string }> => {
  const supabase = await createClient();
  try {
    const { data: existingUser, error: existingUserError } = await supabase
      .from('users')
      .select('email')
      .eq('email', userDetails.email)
      .single();

    if (existingUser) {
      return {
        success: false,
        message: ERROR_MESSAGES.USER_ALREADY_REGISTERED
      };
    }

    if (existingUserError && existingUserError.code !== 'PGRST116') {
      console.error('Error checking for existing user:', existingUserError);
      return {
        success: false,
        message: ERROR_MESSAGES.ERROR_CHECKING_EXISTING
      };
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email: userDetails.email,
        password: userDetails.password
      }
    );

    if (signUpError) {
      return { success: false, message: signUpError.message };
    }

    const authId = signUpData.user?.id as string;
    if (!authId) {
      return { success: false, message: ERROR_MESSAGES.USER_ID_NOT_FOUND };
    }

    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('role', USER_ROLES.CONTRACTOR)
      .single();

    if (roleError) {
      console.error('Error fetching role', roleError);
      return { success: false, message: ERROR_MESSAGES.ROLE_ERROR };
    }

    const roleId = roleData?.id as number;

    const contractorResponse = await addContractorDetails(
      userDetails,
      authId,
      roleId
    );

    if (!contractorResponse.success) {
      return contractorResponse;
    }

    sendPushNotification(authId, 'registration', {
      title: 'Welcome to Safezy!',
      body: 'Your account is ready. Start exploring safety tools and manage your equipment.',
      url: '/contractor/dashboard',
    }).catch((err) => console.error('[push] registration notification failed:', err));

    const encodedEmail = btoa(userDetails.email);

    return {
      success: true,
      message: SUCCESS_MESSAGES.USER_VERIFICATION,
      redirectPath: `${AppRoutes.OTP_VERIFICATION}?email=${encodedEmail}`
    };
  } catch (err) {
    console.error('Sign-up error:', err);
    return { success: false, message: ERROR_MESSAGES.SIGNUP_ERROR };
  }
};

export const loginUser = async (
  userDetails: LoginType
): Promise<{ success: boolean; message: string; redirectPath?: string }> => {
  const supabase = await createClient();

  try {
    // Check if user exists
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', userDetails.email)
      .maybeSingle();

    if (userError) throw userError;

    if (!userData) {
      return {
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND
      };
    }

    if (userData.is_deleted) {
      return {
        success: false,
        message: ERROR_MESSAGES.USER_DELETED
      };
    }

    if (!userData.is_active) {
      return {
        success: false,
        message: ERROR_MESSAGES.USER_DEACTIVATED
      };
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: userDetails.email,
      password: userDetails.password
    });

    if (authError) {
      console.error('Error while logging in:', authError);
      return {
        success: false,
        message: ERROR_MESSAGES.INVALID_CREDENTIALS
      };
    }

    revalidatePath('/', 'layout');

    return {
      success: true,
      message: SUCCESS_MESSAGES.LOGGED_IN
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: ERROR_MESSAGES.LOGIN_ERROR
    };
  }
};

export const verifyOtp = async (
  email: string,
  otp: string
): Promise<{ success: boolean; message: string; redirectPath?: string }> => {
  const supabase = await createClient();
  try {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email'
    });

    if (error) {
      console.error('OTP verification error:', error);
      return {
        success: false,
        message: error.message || ERROR_MESSAGES.OTP_VERIFICATION_FAILED
      };
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.OTP_VERIFIED
    };
  } catch (err) {
    console.error('Unexpected error during OTP verification:', err);
    return {
      success: false,
      message: ERROR_MESSAGES.OTP_VERIFY_ERROR
    };
  }
};

export const resendOtp = async (
  email: string
): Promise<{ success: boolean; message: string }> => {
  const supabase = await createClient();
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.OTP_RESENT
    };
  } catch (err) {
    return {
      success: false,
      message: err.message || ERROR_MESSAGES.OTP_RESEND_ERROR
    };
  }
};

export const forgotPassword = async (email: string) => {
  const supabase = await createClient();
  try {
    const url = process.env.RESET_PASSWORD_URL;
    const { data: userData } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (!userData) {
      return {
        success: false,
        message: ERROR_MESSAGES.USER_NOT_REGISTERED
      };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${url}`
    });

    if (error) {
      console.error('Error during password reset:', error.message);
      return {
        success: false,
        message: error.message || ERROR_MESSAGES.RESET_EMAIL_NOT_SENT
      };
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.PASSWORD_RESET_EMAIL
    };
  } catch (err) {
    console.error('Unexpected error during password reset:', err);
    return {
      success: false,
      message: err.message || ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const resetPassword = async (data: ResetPasswordType) => {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password: data.newPassword
    });

    if (error) {
      console.error('Error resetting password:', error.message);
      return {
        success: false,
        message: ERROR_MESSAGES.RESET_PASSWORD_FAILED
      };
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.PASSWORD_RESET
    };
  } catch (err) {
    console.error('Unexpected error during password reset:', err);
    return {
      success: false,
      message: err.message || ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

// Signup warehouse operator
export const signUpWarehouseOperator = async (
  userDetails: WarehouseOperatorSignUpType
): Promise<{ success: boolean; message: string; redirectPath?: string }> => {
  const supabase = await createClient();

  try {
    const { data: existingUser, error: existingUserError } = await supabase
      .from('users')
      .select('email')
      .eq('email', userDetails.email)
      .single();

    if (existingUser) {
      return {
        success: false,
        message: ERROR_MESSAGES.USER_ALREADY_REGISTERED
      };
    }

    if (existingUserError && existingUserError.code !== 'PGRST116') {
      console.error('Error checking for existing user:', existingUserError);
      return {
        success: false,
        message: ERROR_MESSAGES.ERROR_CHECKING_EXISTING
      };
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email: userDetails.email,
        password: userDetails.password
      }
    );

    if (signUpError) {
      return { success: false, message: signUpError.message };
    }

    const authId = signUpData.user?.id as string;
    if (!authId) {
      return { success: false, message: ERROR_MESSAGES.USER_ID_NOT_FOUND };
    }

    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('role', USER_ROLES.WAREHOUSE_OPERATOR)
      .single();

    if (roleError) {
      console.error('Error fetching role', roleError);
      return { success: false, message: ERROR_MESSAGES.ROLE_ERROR };
    }

    const roleId = roleData?.id as number;

    const warehouseResponse = await addWarehouseOperatorDetails(
      userDetails,
      authId,
      roleId
    );
    if (!warehouseResponse.success) {
      return warehouseResponse;
    }

    const encodedEmail = btoa(userDetails.email);

    return {
      success: true,
      message: SUCCESS_MESSAGES.USER_VERIFICATION,
      redirectPath: `${AppRoutes.OTP_VERIFICATION}?email=${encodedEmail}`
    };
  } catch (err) {
    console.error('Sign-up error:', err);
    return { success: false, message: ERROR_MESSAGES.SIGNUP_ERROR };
  }
};

export const signUpPrincipalUser = async (
  userDetails: PrincipalRegisterType
): Promise<{ success: boolean; message: string; redirectPath?: string }> => {
  const supabase = await createClient();
  try {
    const { data: existingUser, error: existingUserError } = await supabase
      .from('users')
      .select('email')
      .eq('email', userDetails.email)
      .single();

    if (existingUser) {
      return {
        success: false,
        message: ERROR_MESSAGES.USER_ALREADY_REGISTERED
      };
    }

    if (existingUserError && existingUserError.code !== 'PGRST116') {
      console.error('Error checking for existing user:', existingUserError);
      return {
        success: false,
        message: ERROR_MESSAGES.ERROR_CHECKING_EXISTING
      };
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email: userDetails.email,
        password: userDetails.password
      }
    );

    if (signUpError) {
      return { success: false, message: signUpError.message };
    }

    const authId = signUpData.user?.id as string;
    if (!authId) {
      return { success: false, message: ERROR_MESSAGES.USER_ID_NOT_FOUND };
    }

    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('role', USER_ROLES.PRINCIPAL_EMPLOYER)
      .single();

    if (roleError) {
      console.error('Error fetching role', roleError);
      return { success: false, message: ERROR_MESSAGES.ROLE_ERROR };
    }

    const roleId = roleData?.id;

    const PrincipalEmployerResponse = await addPrincipalDetails(
      userDetails,
      authId,
      roleId
    );
    if (!PrincipalEmployerResponse.success) {
      return PrincipalEmployerResponse;
    }

    const encodedEmail = btoa(userDetails.email);

    return {
      success: true,
      message: SUCCESS_MESSAGES.USER_VERIFICATION,
      redirectPath: `${AppRoutes.OTP_VERIFICATION}?email=${encodedEmail}`
    };
  } catch (err) {
    console.error('Sign-up error:', err);
    return { success: false, message: ERROR_MESSAGES.SIGNUP_ERROR };
  }
};

export const signOutUser = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  const supabase = await createClient();
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.SIGN_OUT_SUCCESS
    };
  } catch (err) {
    return {
      success: false,
      message: err.message
    };
  }
};
