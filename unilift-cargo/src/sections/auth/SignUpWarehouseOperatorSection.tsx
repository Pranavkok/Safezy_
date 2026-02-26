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

// Validations
import { SignUpWarehouseOperatorSchema } from '@/validations/auth/signup-warehouse-operator';

import { z } from 'zod';
import PasswordFieldWithLabel from '@/components/inputs-fields/PasswordFieldWithLabel';
import { signUpWarehouseOperator } from '@/actions/auth';
import { AppRoutes } from '@/constants/AppRoutes';

export type WarehouseOperatorSignUpType = z.infer<
  typeof SignUpWarehouseOperatorSchema
>;

const SignUpWarehouseOperatorSection = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<WarehouseOperatorSignUpType>({
    resolver: zodResolver(SignUpWarehouseOperatorSchema)
  });
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  const onSubmit = async (data: WarehouseOperatorSignUpType) => {
    try {
      setLoading(true);

      const response = await signUpWarehouseOperator(data);
      if (response.success) {
        toast.success(response.message);
        if (response.redirectPath) router.push(response.redirectPath);
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
      <div className="grid lg:grid-cols-2 lg:gap-x-4">
        <InputFieldWithLabel
          label="Store Name"
          type="text"
          errorText={errors.storeName?.message as string}
          required
          {...register('storeName')}
        />

        <InputFieldWithLabel
          label="Email"
          type="email"
          errorText={errors.email?.message as string}
          required
          {...register('email')}
        />

        <InputFieldWithLabel
          type="tel"
          label="Contact No."
          maxLength={10}
          minLength={10}
          errorText={errors.contactNumber?.message}
          required
          {...register('contactNumber')}
        />

        <InputFieldWithLabel
          label="Address 1"
          type="text"
          errorText={errors.address1?.message as string}
          required
          {...register('address1')}
        />

        <InputFieldWithLabel
          label="Address 2"
          type="text"
          errorText={errors.address2?.message as string}
          {...register('address2')}
        />

        <InputFieldWithLabel
          label="Locality"
          type="text"
          errorText={errors.locality?.message as string}
          {...register('locality')}
        />

        <InputFieldWithLabel
          label="City"
          type="text"
          errorText={errors.city?.message as string}
          required
          {...register('city')}
        />

        <InputFieldWithLabel
          label="Zipcode"
          type="text"
          errorText={errors.zipcode?.message as string}
          required
          {...register('zipcode')}
        />

        <InputFieldWithLabel
          label="State"
          type="text"
          errorText={errors.state?.message as string}
          required
          {...register('state')}
        />

        <InputFieldWithLabel
          label="Country"
          type="text"
          errorText={errors.country?.message as string}
          required
          {...register('country')}
        />

        <PasswordFieldWithLabel
          id="password"
          label="Password"
          errorText={errors.password?.message}
          {...register('password')}
          required
        />
      </div>

      <div className="pt-5 grid place-content-center">
        <Button
          type="submit"
          className="w-full lg:w-[390px] "
          disabled={loading}
        >
          {loading && <ButtonSpinner />}
          {loading ? 'Submitting...' : 'Create an account'}
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

export default SignUpWarehouseOperatorSection;
