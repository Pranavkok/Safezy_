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
import { sendPushNotification } from '@/lib/web-push';
import { createServiceClient } from '@/utils/supabase/service';

// Supabase silently returns identities:[] instead of an error when the email
// already exists in auth.users (e.g. orphaned after an admin delete). This helper
// detects that case, wipes the orphaned auth record, and retries signup so the
// OTP email is actually delivered.
async function signUpWithOrphanCleanup(
  supabase: Awaited<ReturnType<typeof createClient>>,
  email: string,
  password: string,
  metadata?: Record<string, unknown>
): Promise<{ id: string } | { error: string }> {
  const attempt = async () =>
    supabase.auth.signUp({
      email,
      password,
      options: metadata ? { data: metadata } : undefined
    });

  let { data, error } = await attempt();

  if (error) return { error: error.message };

  if (data.user?.identities?.length === 0) {
    // Orphaned auth record — delete it via service role then retry once
    const serviceClient = createServiceClient();
    await serviceClient.auth.admin.deleteUser(data.user.id);
    ({ data, error } = await attempt());
    if (error) return { error: error.message };
  }

  const id = data.user?.id;
  if (!id) return { error: ERROR_MESSAGES.USER_ID_NOT_FOUND };
  return { id };
}

export const signUpUser = async (
  userDetails: SignUpType
): Promise<{ success: boolean; message: string; redirectPath?: string }> => {
  const supabase = await createClient();
  const serviceClient = createServiceClient();
  try {
    const [existingUserResult, existingContactResult] = await Promise.all([
      serviceClient
        .from('users')
        .select('id')
        .ilike('email', userDetails.email.trim())
        .maybeSingle(),
      serviceClient
        .from('users')
        .select('id')
        .eq('contact_number', userDetails.contactNumber.trim())
        .maybeSingle()
    ]);

    if (existingUserResult.error || existingContactResult.error) {
      console.error(
        'Error checking for existing user:',
        existingUserResult.error ?? existingContactResult.error
      );
      return {
        success: false,
        message: ERROR_MESSAGES.ERROR_CHECKING_EXISTING
      };
    }

    if (existingUserResult.data) {
      return {
        success: false,
        message: ERROR_MESSAGES.USER_ALREADY_REGISTERED
      };
    }

    if (existingContactResult.data) {
      return {
        success: false,
        message: ERROR_MESSAGES.CONTACT_ALREADY_REGISTERED
      };
    }

    const result = await signUpWithOrphanCleanup(
      supabase,
      userDetails.email,
      userDetails.password,
      {
        _pending_db_insert: 'contractor',
        fName: userDetails.fName,
        lName: userDetails.lName,
        cName: userDetails.cName,
        contactNumber: userDetails.contactNumber,
        email: userDetails.email,
        noOfWorkers: userDetails.noOfWorkers ?? null,
        typeOfServicesProvided: userDetails.typeOfServicesProvided ?? [],
        typeOfServicesProvidedOther:
          userDetails.typeOfServicesProvidedOther ?? null,
        industriesServed: userDetails.industriesServed ?? [],
        geographicalLocation: userDetails.geographicalLocation ?? [],
        industriesServedOther: userDetails.industriesServedOther ?? null,
        companies: userDetails.companies ?? [],
        locations: userDetails.locations ?? []
      }
    );

    if ('error' in result) {
      return { success: false, message: result.error };
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

export const loginUser = async (
  userDetails: LoginType
): Promise<{ success: boolean; message: string; redirectPath?: string }> => {
  const supabase = await createClient();
  const serviceClient = createServiceClient();

  try {
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
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

    const authId = authData.user?.id;
    if (!authId) {
      console.error('Login error: missing auth user after successful sign-in');
      return {
        success: false,
        message: ERROR_MESSAGES.LOGIN_ERROR
      };
    }

    const { data: userData, error: userError } = await serviceClient
      .from('users')
      .select('is_active, is_deleted')
      .eq('auth_id', authId)
      .maybeSingle();

    if (userError) throw userError;

    if (!userData) {
      await supabase.auth.signOut();
      return {
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND
      };
    }

    if (userData.is_deleted) {
      await supabase.auth.signOut();
      return {
        success: false,
        message: ERROR_MESSAGES.USER_DELETED
      };
    }

    if (!userData.is_active) {
      await supabase.auth.signOut();
      return {
        success: false,
        message: ERROR_MESSAGES.USER_DEACTIVATED
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
      type: 'signup'
    });

    if (error) {
      console.error('OTP verification error:', error);
      return {
        success: false,
        message: error.message || ERROR_MESSAGES.OTP_VERIFICATION_FAILED
      };
    }

    // If this was a contractor self-registration, insert DB row now that email is confirmed.
    // We use serviceClient to avoid any session-cookie timing dependency.
    const {
      data: { user }
    } = await supabase.auth.getUser();
    const meta = user?.user_metadata;

    if (meta?._pending_db_insert === 'contractor' && user?.id) {
      const serviceClient = createServiceClient();

      // Safeguard: skip if a row was somehow already created (re-verify edge case)
      const { data: existing, error: existingError } = await serviceClient
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .maybeSingle();

      if (existingError) {
        console.error('Error checking for a completed signup:', existingError);
        await serviceClient.auth.admin.deleteUser(user.id);
        return { success: false, message: ERROR_MESSAGES.OTP_VERIFY_ERROR };
      }

      if (!existing) {
        const { data: roleData, error: roleError } = await serviceClient
          .from('user_roles')
          .select('id')
          .eq('role', USER_ROLES.CONTRACTOR)
          .single();

        if (roleError || !roleData) {
          console.error(
            'Error fetching contractor role during signup:',
            roleError
          );
          await serviceClient.auth.admin.deleteUser(user.id);
          return { success: false, message: ERROR_MESSAGES.OTP_VERIFY_ERROR };
        }

        if (roleData) {
          const fName = meta.fName as string;
          const lName = meta.lName as string;
          const contact = meta.contactNumber as string;
          const cName = meta.cName as string;

          // Generate a unique user code
          const makeCode = () => {
            const r = Math.floor(100000 + Math.random() * 900000).toString();
            return `${fName[0].toLowerCase()}${lName[0].toLowerCase()}${contact.slice(0, 2)}-${contact.slice(-2)}${cName.slice(0, 4).toLowerCase()}-${r}`;
          };
          let code: string;
          let taken: unknown;
          do {
            code = makeCode();
            const { data } = await serviceClient
              .from('users')
              .select('user_unique_code')
              .eq('user_unique_code', code)
              .single();
            taken = data;
          } while (taken);

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error: insertError } = await (
            serviceClient.from('users') as any
          ).insert({
            first_name: fName,
            last_name: lName,
            contact_number: contact,
            email: meta.email,
            company_name: cName,
            total_workers: meta.noOfWorkers ?? null,
            locations_served: meta.locations ?? [],
            companies_served: meta.companies ?? [],
            industries_type: meta.industriesServed ?? [],
            service_type: meta.typeOfServicesProvided ?? [],
            other_industries_type: meta.industriesServedOther ?? null,
            other_services_type: meta.typeOfServicesProvidedOther ?? null,
            geographical_location: meta.geographicalLocation ?? [],
            auth_id: user.id,
            role_id: roleData.id,
            user_unique_code: code!
          });

          if (insertError) {
            console.error(
              'Error creating user profile after OTP verification:',
              insertError
            );

            // Do not leave an Auth-only account behind when profile creation fails.
            const { error: cleanupError } =
              await serviceClient.auth.admin.deleteUser(user.id);
            if (
              cleanupError &&
              !cleanupError.message?.toLowerCase().includes('not found')
            ) {
              console.error(
                'Error cleaning up incomplete Auth account:',
                cleanupError
              );
            }

            const uniqueErrorText = `${insertError.message ?? ''} ${insertError.details ?? ''}`;
            if (
              insertError.code === '23505' &&
              (uniqueErrorText.includes('users_contact_number_unique') ||
                uniqueErrorText.includes('contact_number'))
            ) {
              return {
                success: false,
                message: ERROR_MESSAGES.CONTACT_ALREADY_REGISTERED
              };
            }

            return { success: false, message: ERROR_MESSAGES.SIGNUP_ERROR };
          }

          sendPushNotification(user.id, 'registration', {
            title: 'Welcome to Safezy!',
            body: 'Your account is ready. Start exploring safety tools and manage your equipment.',
            url: '/contractor/dashboard'
          }).catch(err =>
            console.error('[push] registration notification failed:', err)
          );
        }
      }
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
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email
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
      redirectTo: 'https://safezy.in/auth/reset-confirm'
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

    const result = await signUpWithOrphanCleanup(
      supabase,
      userDetails.email,
      userDetails.password
    );

    if ('error' in result) {
      return { success: false, message: result.error };
    }

    const authId = result.id;

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

    const result = await signUpWithOrphanCleanup(
      supabase,
      userDetails.email,
      userDetails.password
    );

    if ('error' in result) {
      return { success: false, message: result.error };
    }

    const authId = result.id;

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
