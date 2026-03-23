'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import ButtonSpinner from '@/components/ButtonSpinner';
import InputFieldWithLabel from '@/components/inputs-fields/InputFieldWithLabel';
import PasswordFieldWithLabel from '@/components/inputs-fields/PasswordFieldWithLabel';

import { AddStaffSchema, AddStaffFormType } from '@/validations/admin/add-staff';
import { createStaffUser } from '@/actions/admin/staff';
import { AppRoutes } from '@/constants/AppRoutes';

const AddStaffSection = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<AddStaffFormType>({
    resolver: zodResolver(AddStaffSchema)
  });

  const onSubmit = async (data: AddStaffFormType) => {
    try {
      setLoading(true);
      const response = await createStaffUser(data);
      if (response.success) {
        toast.success(response.message);
        router.push(AppRoutes.ADMIN_STAFF_LISTING);
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid lg:grid-cols-2 lg:gap-x-4">
        <InputFieldWithLabel
          label="First Name"
          placeholder="Enter first name"
          error={errors.firstName?.message}
          {...register('firstName')}
        />
        <InputFieldWithLabel
          label="Last Name"
          placeholder="Enter last name"
          error={errors.lastName?.message}
          {...register('lastName')}
        />
        <InputFieldWithLabel
          label="Email"
          type="email"
          placeholder="Enter email address"
          error={errors.email?.message}
          {...register('email')}
        />
        <InputFieldWithLabel
          label="Contact Number"
          placeholder="Enter contact number"
          error={errors.contactNumber?.message}
          {...register('contactNumber')}
        />
        <PasswordFieldWithLabel
          label="Password"
          placeholder="Enter password"
          error={errors.password?.message}
          {...register('password')}
        />

        {/* Role selector */}
        <div className="flex flex-col gap-1 mb-4">
          <label className="text-sm font-medium text-gray-700">Role</label>
          <select
            {...register('role')}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select a role</option>
            <option value="manager">Manager</option>
            <option value="safety_officer">Safety Officer</option>
          </select>
          {errors.role && (
            <p className="text-xs text-red-500">{errors.role.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <Button
          type="button"
          variant="outline"
          className="mr-3"
          onClick={() => router.push(AppRoutes.ADMIN_STAFF_LISTING)}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="min-w-32">
          {loading ? <ButtonSpinner /> : 'Create Account'}
        </Button>
      </div>
    </form>
  );
};

export default AddStaffSection;
