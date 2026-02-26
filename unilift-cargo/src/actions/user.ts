'use server';

import { jwtDecode, JwtPayload } from 'jwt-decode';
import { createClient } from '@/utils/supabase/server';
import { UserDataType } from '@/context/UserContext';

// Utility function to get Supabase session
const getSupabaseSession = async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
};

// Utility function to get authenticated user
const getAuthUser = async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
};

// Utility function to get auth Id
export const getAuthId = async () => {
  const user = await getAuthUser();
  return user?.id ?? null;
};

type CustomJwtType = JwtPayload & {
  user_role: string;
};

// Utility function to get user role
export const getUserRole = async () => {
  const session = await getSupabaseSession();
  if (!session) return null;

  const jwt: CustomJwtType = jwtDecode(session.access_token);
  return jwt.user_role;
};

export const getUserIdFromAuth = async () => {
  const supabase = await createClient();

  const authId = await getAuthId();
  if (!authId) {
    console.error('Error fetching user data....');
    return null;
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', authId)
    .maybeSingle();

  if (userError || !userData) {
    console.error('Error fetching user data', userError);
    return null;
  }

  return userData?.id;
};

const defaultUserData: UserDataType = {
  authId: null,
  userId: null,
  userRole: null,
  firstName: null,
  lastName: null,
  contactNumber: null,
  email: null,
  companyName: null
};

// Get user details by combining auth and database information
export const getUserDetails = async (): Promise<UserDataType> => {
  try {
    // Get Supabase session
    const session = await getSupabaseSession();

    // Early return if no authenticated user
    if (!session) {
      return defaultUserData;
    }

    // Decode JWT to get user role
    const jwt: CustomJwtType = jwtDecode(session.access_token);

    // Fetch user data from database
    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, first_name, last_name, contact_number, email, company_name')
      .eq('auth_id', session.user.id)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError.message);
      return defaultUserData;
    }

    // Return combined user information
    return {
      authId: session.user.id,
      userId: userData?.id ?? null,
      userRole: jwt.user_role ?? null,
      firstName: userData?.first_name ?? null,
      lastName: userData?.last_name ?? null,
      contactNumber: userData?.contact_number ?? null,
      email: userData?.email ?? null,
      companyName: userData?.company_name ?? null
    };
  } catch (error) {
    console.error('Error in getUserDetails:', error);
    return defaultUserData;
  }
};
