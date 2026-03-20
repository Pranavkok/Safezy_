export const dynamic = 'force-static';

// External Librarie
import type { Metadata } from 'next';
import ResetPasswordSection from '@/sections/auth/ResetPasswordSection';

export const metadata: Metadata = {
  title: 'Safezy - Reset Password',
  description: 'Reset your password to regain access to your Safezy account.'
};

const ResetPasswordPage = () => {
  return <ResetPasswordSection />;
};

export default ResetPasswordPage;
