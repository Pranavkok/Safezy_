export const dynamic = 'force-static';
import type { Metadata } from 'next';
import SignUpSection from '@/sections/auth/SignUpSection';
import SignUpWarehouseOperatorSection from '@/sections/auth/SignUpWarehouseOperatorSection'; // Update the import path based on your structure
import PrincipalRegistration from '@/sections/auth/SignUpPrincipalSection';
import { SearchParamsType } from '@/types/index.types';
import AuthLayout from '@/layouts/AuthLayout';

export const metadata: Metadata = {
  title: 'Safezy - Sign Up',
  description:
    'Create an account on Safezy to access our services and features.'
};

type SignUpType = 'contractor' | 'warehouse' | 'principal';

interface SignUpConfig {
  component: React.ReactNode;
  title: string;
  className: string;
}
const signUpConfigs: Record<SignUpType, SignUpConfig> = {
  contractor: {
    component: <SignUpSection />,
    title: 'Registration',
    className: 'w-[945px] mt-10 mb-2'
  },
  warehouse: {
    component: <SignUpWarehouseOperatorSection />,
    title: 'Sign Up for Warehouse Operator',
    className: 'w-[945px] mt-10 mb-2'
  },
  principal: {
    component: <PrincipalRegistration />,
    title: 'Sign Up for Principal',
    className: 'w-[520px]'
  }
};

const SignUpPage = ({ searchParams }: SearchParamsType) => {
  const signUpType = searchParams.type as SignUpType | undefined;

  // Get configuration or use default (contractor)
  const config =
    signUpType && signUpConfigs[signUpType]
      ? signUpConfigs[signUpType]
      : signUpConfigs.contractor;

  return (
    <AuthLayout title={config.title} className={config.className}>
      {config.component}
    </AuthLayout>
  );
};

export default SignUpPage;
