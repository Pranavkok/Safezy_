'use client';
// External Libraries
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

// Internal Components
import { Button } from '@/components/ui/button';
import ButtonSpinner from '@/components/ButtonSpinner';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot
} from '@/components/ui/input-otp';

// Validations
import { OtpVerificationFormSchema } from '@/validations/auth/sign-up';

// Types
import { OtpType } from '@/types/auth.types';

// Actions
import { resendOtp, verifyOtp } from '@/actions/auth';
import { ROLE_TO_PATH_MAP } from '@/utils';
import { useUser } from '@/context/UserContext';
import { Bell, ChevronRight, X } from 'lucide-react';
import { AppRoutes } from '@/constants/AppRoutes';
import { sendSignupSuccessful } from '@/actions/email';
import Link from 'next/link';

const OtpVerificationSection = () => {
  const searchParams = useSearchParams();

  const { refreshUserData } = useUser();

  const email = atob(searchParams.get('email') || '');

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<OtpType>({
    resolver: zodResolver(OtpVerificationFormSchema),
    defaultValues: {
      otp: ''
    }
  });

  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  if (!email) {
    toast.error('Invalid or expired link. Please try again.');
    return null;
  }

  const onSubmit = async (data: OtpType) => {
    setLoading(true);
    try {
      const res = await verifyOtp(email, data.otp);
      if (res.success) {
        const userData = await refreshUserData();

        await sendSignupSuccessful(
          userData.email!,
          userData.firstName!,
          userData.lastName!
        );

        const redirectPath = userData.userRole
          ? ROLE_TO_PATH_MAP[userData.userRole]
          : AppRoutes.HOME;

        router.push(redirectPath);
        toast.success(res.message);

        if (redirectPath === AppRoutes.HOME) {
          toast.custom(
            t => (
              <div
                className={`${
                  t.visible ? 'animate-enter' : 'animate-leave'
                } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex flex-col ring-1 ring-black ring-opacity-5  overflow-hidden `}
                style={{
                  opacity: t.visible ? 1 : 0,
                  transform: t.visible ? 'translateY(0)' : 'translateY(-8px)'
                }}
              >
                {/* Header with title and close button */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />

                    <p className="font-medium text-gray-900">
                      Welcome to Safezy!
                    </p>
                  </div>
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Get personalized PPE recommendations based on your location
                    and needs.{' '}
                  </p>
                </div>

                <div className="border-t flex w-full  gap-4 border border-gray-100 p-3">
                  <Button
                    variant={'outline'}
                    className="bg-white w-full"
                    onClick={() => toast.dismiss(t.id)}
                  >
                    Dismiss
                  </Button>
                  <Link
                    href={AppRoutes.RECOMMENDED_PRODUCTS}
                    onClick={() => toast.dismiss(t.id)}
                    className="w-full sm:w-auto"
                  >
                    <Button className="capitalize font-medium text-sm">
                      View Recommendations
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ),
            {
              duration: 10000,
              position: 'top-right'
            }
          );
        }
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    const res = await resendOtp(email);

    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-3 w-full">
          <label className=" text-xs">We’ve sent you the code on {email}</label>
          <Controller
            name="otp"
            control={control}
            render={({ field }) => (
              <InputOTP className="" maxLength={6} {...field}>
                <InputOTPGroup className="flex flex-grow">
                  <InputOTPSlot
                    index={0}
                    className=" w-10 h-10 xs:w-12 xs:h-12  sm:w-16    sm:h-12"
                  />
                  <InputOTPSlot
                    index={1}
                    className=" w-10 h-10 xs:w-12 xs:h-12  sm:w-16    sm:h-12"
                  />
                  <InputOTPSlot
                    index={2}
                    className=" w-10 h-10 xs:w-12 xs:h-12  sm:w-16    sm:h-12"
                  />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup className="flex flex-grow">
                  <InputOTPSlot
                    index={3}
                    className=" w-10 h-10 xs:w-12 xs:h-12  sm:w-16    sm:h-12"
                  />
                  <InputOTPSlot
                    index={4}
                    className=" w-10 h-10 xs:w-12 xs:h-12  sm:w-16    sm:h-12"
                  />
                  <InputOTPSlot
                    index={5}
                    className=" w-10 h-10 xs:w-12 xs:h-12  sm:w-16    sm:h-12"
                  />
                </InputOTPGroup>
              </InputOTP>
            )}
          />
          {errors?.otp?.message && (
            <p className="text-red-500">{errors.otp.message}</p>
          )}
        </div>
        <div className="pt-5 flex flex-col justify-center">
          <Button type="submit" className="w-full " disabled={loading}>
            {loading && <ButtonSpinner />}
            {loading ? 'Submitting...' : 'Continue'}
          </Button>
        </div>
      </form>

      <div className="flex flex-col justify-center align-middle mt-3 gap-1 ">
        <Button
          className=" text-black hover:text-[#2A39C1] h-5"
          size={'lg'}
          variant={'link'}
        >
          Didn’t receive the email?{' '}
        </Button>
        <Button
          type="button"
          size={'lg'}
          variant={'link'}
          onClick={() => handleResendCode()}
        >
          Resend Code
        </Button>
      </div>
    </>
  );
};

export default OtpVerificationSection;
