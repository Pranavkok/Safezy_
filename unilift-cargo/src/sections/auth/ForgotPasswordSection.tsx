'use client';
// External Libraries
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

// Internal Components
import AuthLayout from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/button';
import ButtonSpinner from '@/components/ButtonSpinner';
import InputFieldWithLabel from '@/components/inputs-fields/InputFieldWithLabel';

// Validations
import { ForgotPasswordSchema } from '@/validations/auth/forgot-password';

// Types
import { ForgotPasswordType } from '@/types/auth.types';

// Actions
import { forgotPassword } from '@/actions/auth';

const ForgotPasswordSection = () => {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ForgotPasswordType>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  });

  const [loading, setLoading] = useState<boolean>(false);

  const onSubmit = async (data: ForgotPasswordType) => {
    setLoading(true);
    const res = await forgotPassword(data.email);
    setLoading(false);
    if (res.success) {
      setIsEmailSent(true);

      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  return (
    <AuthLayout
      className="w-[520px]"
      title={isEmailSent ? 'Hi, Check Your Mail' : 'Forgot Password'}
      subtitle={
        isEmailSent ? 'Check your email for the reset password link!' : ''
      }
    >
      {!isEmailSent && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <InputFieldWithLabel
            label="Email Address"
            type="email"
            errorText={errors.email?.message}
            required
            {...register('email')}
            removeBottomPadding
          />
          <p className="text-xs mt-1">Do not forget to check the SPAM box.</p>

          <div className="pt-5 flex flex-col justify-center">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <ButtonSpinner />}
              {loading ? 'Submitting...' : 'Send Email'}
            </Button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPasswordSection;
