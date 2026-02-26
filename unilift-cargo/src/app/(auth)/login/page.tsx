export const dynamic = 'force-static';
import type { Metadata } from 'next';
import LoginSection from '@/sections/auth/LoginSection';
import AuthLayout from '@/layouts/AuthLayout';

export const metadata: Metadata = {
  title: 'Safezy - Login',
  description:
    'Login to your Safezy account to manage your personal protective equipment.'
};

const LoginPage = () => {
  return (
    <AuthLayout title="Login" className="w-[520px]">
      <LoginSection />
    </AuthLayout>
  );
};

export default LoginPage;
