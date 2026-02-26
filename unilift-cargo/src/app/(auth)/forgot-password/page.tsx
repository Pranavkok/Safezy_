export const dynamic = 'force-static';

import type { Metadata } from 'next';
import ForgotPasswordSection from '@/sections/auth/ForgotPasswordSection';

export const metadata: Metadata = {
  title: 'Safezy - Forgot Password ',
  description:
    'Recover your password at Safezy. Enter your email to receive reset instructions.'
};

const ForgotPasswordPage = () => {
  return <ForgotPasswordSection />;
};

export default ForgotPasswordPage;
