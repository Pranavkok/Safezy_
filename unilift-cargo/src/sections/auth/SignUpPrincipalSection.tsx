'use client';

import React, { useState } from 'react';
import { signUpPrincipalUser } from '@/actions/auth';
import ButtonSpinner from '@/components/ButtonSpinner';
import InputFieldWithLabel from '@/components/inputs-fields/InputFieldWithLabel';
import PasswordFieldWithLabel from '@/components/inputs-fields/PasswordFieldWithLabel';
import { Button } from '@/components/ui/button';
import { PrincipalRegisterType } from '@/types/auth.types';
import { PrincipalRegistrationSchema } from '@/validations/auth/principal-register';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { AppRoutes } from '@/constants/AppRoutes';

const PrincipalRegistration = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<PrincipalRegisterType>({
    resolver: zodResolver(PrincipalRegistrationSchema)
  });
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  const onSubmit = async (data: PrincipalRegisterType) => {
    setLoading(true);
    const res = await signUpPrincipalUser(data);
    setLoading(false);
    if (res.success) {
      toast.success(res.message);
      if (res.redirectPath) router.push(res.redirectPath);
    } else {
      toast.error(res.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <InputFieldWithLabel
        label="Username"
        type="text"
        errorText={errors.fName?.message as string}
        required
        {...register('fName')}
      />

      <InputFieldWithLabel
        label="Email Address"
        type="email"
        errorText={errors.email?.message as string}
        required
        {...register('email')}
      />

      <InputFieldWithLabel
        label="contact Number"
        type="text"
        errorText={errors.contactNumber?.message as string}
        required
        {...register('contactNumber')}
      />

      <PasswordFieldWithLabel
        label="Password"
        required
        errorText={errors.password?.message as string}
        removeBottomPadding
        {...register('password')}
      />

      <div className="pt-5 flex flex-col">
        <Button type="submit" className="w-full " disabled={loading}>
          {loading && <ButtonSpinner />}
          {loading ? 'Submitting...' : 'Sign Up'}
        </Button>
        <Button
          type={'button'}
          variant={'link'}
          onClick={() => router.push(AppRoutes.LOGIN)}
        >
          Already have an account?
        </Button>
      </div>
    </form>
  );
};

export default PrincipalRegistration;
