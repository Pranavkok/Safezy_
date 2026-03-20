'use client';
// External Libraries
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

// Internal Components
import { Button } from '@/components/ui/button';
import ButtonSpinner from '@/components/ButtonSpinner';
import InputFieldWithLabel from '@/components/inputs-fields/InputFieldWithLabel';
import PasswordFieldWithLabel from '@/components/inputs-fields/PasswordFieldWithLabel';
import { ROLE_TO_PATH_MAP } from '@/utils';

// Routes
import { AppRoutes } from '@/constants/AppRoutes';

// Validations
import { LoginFormSchema } from '@/validations/auth/login';

// Types
import { LoginType } from '@/types/auth.types';

// Actions
import { loginUser } from '@/actions/auth';
import { useUser } from '@/context/UserContext';

const LoginSection = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginType>({
    resolver: zodResolver(LoginFormSchema)
  });
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  const { refreshUserData } = useUser();

  const onSubmit = async (data: LoginType) => {
    try {
      setLoading(true);

      const response = await loginUser(data);
      if (response.success) {
        const userData = await refreshUserData();
        const redirectPath = userData.userRole
          ? ROLE_TO_PATH_MAP[userData.userRole]
          : AppRoutes.HOME;

        router.push(redirectPath);
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <InputFieldWithLabel
        label="Email Address"
        type="email"
        errorText={errors.email?.message as string}
        required
        {...register('email')}
      />

      <PasswordFieldWithLabel
        label="Password"
        required
        errorText={errors.password?.message as string}
        removeBottomPadding
        {...register('password')}
      />

      <div className="flex justify-end w-full">
        <Button
          type="button"
          onClick={() => router.push(AppRoutes.FORGOT_PASSWORD)}
          className="underline text-black hover:text-[#2A39C1]"
          size={'sm'}
          variant={'link'}
        >
          Forgot Password?
        </Button>
      </div>

      <div className="pt-4 flex flex-col justify-center">
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <ButtonSpinner />}
          {loading ? 'Submitting...' : 'Login'}
        </Button>

        <Button
          type="button"
          variant={'link'}
          onClick={() => router.push(AppRoutes.SIGN_UP)}
        >
          {"Don't have an account?"}
        </Button>
      </div>
    </form>
  );
};

export default LoginSection;
