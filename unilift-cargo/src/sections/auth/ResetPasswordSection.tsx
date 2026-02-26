'use client';
// External Libraries
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

// Internal Components
import AuthLayout from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/button';
import ButtonSpinner from '@/components/ButtonSpinner';
import PasswordFieldWithLabel from '@/components/inputs-fields/PasswordFieldWithLabel';

// Validations
import { ResetPasswordSchema } from '@/validations/auth/reset-password';

// Types
import { ResetPasswordType } from '@/types/auth.types';

// Actions
import { resetPassword } from '@/actions/auth';
import { useUser } from '@/context/UserContext';
import { ROLE_TO_PATH_MAP } from '@/utils';
import { AppRoutes } from '@/constants/AppRoutes';

const ResetPasswordSection = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ResetPasswordType>({
    resolver: zodResolver(ResetPasswordSchema)
  });

  const router = useRouter();
  const { refreshUserData } = useUser();

  const [loading, setLoading] = useState<boolean>(false);

  const onSubmit: SubmitHandler<ResetPasswordType> = async data => {
    setLoading(true);

    const res = await resetPassword(data);
    setLoading(false);

    if (res.success) {
      const userData = await refreshUserData();
      const redirectPath = userData.userRole
        ? ROLE_TO_PATH_MAP[userData.userRole]
        : AppRoutes.HOME;
      router.push(redirectPath);
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  return (
    <AuthLayout className="w-[520px]" title="Reset Password">
      <form onSubmit={handleSubmit(onSubmit)}>
        <PasswordFieldWithLabel
          label="Enter New Password"
          required
          {...register('newPassword')}
          errorText={errors.newPassword?.message as string}
        />
        <PasswordFieldWithLabel
          label="Confirm New Password"
          required
          {...register('confirmPassword')}
          errorText={errors.confirmPassword?.message as string}
        />
        <div className="pt-5 flex flex-col justify-center">
          <Button type="submit" className="w-full " disabled={loading}>
            {loading && <ButtonSpinner />}
            {loading ? 'Submitting...' : 'Reset Password'}
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ResetPasswordSection;
