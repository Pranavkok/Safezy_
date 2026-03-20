export const dynamic = 'force-static';
// External Librarie
import type { Metadata } from 'next';
import OtpVerificationSection from '@/sections/auth/OtpVerificationSection';
import AuthLayout from '@/layouts/AuthLayout';

export const metadata: Metadata = {
  title: 'Safezy - OTP Verification',
  description: 'Verify your OTP to access your Safezy account.'
};

const OtpVerification = () => {
  return (
    <AuthLayout
      className="w-[520px]"
      title="Enter Verification Code"
      subtitle="We’ve sent you the verification code on mail"
    >
      <OtpVerificationSection />
    </AuthLayout>
  );
};

export default OtpVerification;
