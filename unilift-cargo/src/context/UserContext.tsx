'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback
} from 'react';
import { getUserDetails } from '@/actions/user';
import { signOutUser } from '@/actions/auth';
import { useRouter } from 'next/navigation';

// User Data type
export type UserDataType = {
  authId: string | null;
  userId: string | null;
  userRole: string | null;
  firstName: string | null;
  lastName: string | null;
  contactNumber: string | null;
  email: string | null;
  companyName: string | null;
};

// Authentication Context Type
type UserContextType = UserDataType & {
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<UserDataType>;
};

// Default user data
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

// Create User Context
const UserContext = createContext<UserContextType | undefined>(undefined);

// User Provider Component
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [userData, setUserData] = useState<UserDataType>(defaultUserData);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user details
  const fetchUserDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getUserDetails();
      setUserData(data);
      return data;
    } catch (error) {
      console.error('Error fetching user details:', error);
      setUserData(defaultUserData);
      return defaultUserData;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Method to explicitly refresh user data
  const refreshUserData = useCallback(async () => {
    return await fetchUserDetails();
  }, [fetchUserDetails]);

  // Logout functionality
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await signOutUser();
      setUserData(defaultUserData);
      setIsLoading(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [router]);

  useEffect(() => {
    const initializeAuth = async () => {
      await fetchUserDetails();
    };

    initializeAuth();
  }, []);

  // Memoized context value
  const value = useMemo(
    () => ({
      ...userData,
      isLoading,
      logout,
      refreshUserData
    }),
    [userData, isLoading, logout, refreshUserData]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Custom hook to use user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
