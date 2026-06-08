'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import ButtonSpinner from '@/components/ButtonSpinner';
import InputFieldWithLabel from '@/components/inputs-fields/InputFieldWithLabel';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

import { createContractorByAdmin } from '@/actions/admin/contractor';

const AddCustomerSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required.'),
    lastName: z.string().trim().min(1, 'Last name is required.'),
    companyName: z.string().trim().min(1, 'Company name is required.'),
    email: z
      .string()
      .trim()
      .min(1, 'Email is required.')
      .email('Please provide a valid email address.'),
    contactNumber: z
      .string()
      .length(10, 'Contact number must be exactly 10 digits.')
      .regex(/^\d+$/, 'Contact number must contain only digits.'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .regex(/[a-z]/, 'Must include a lowercase letter.')
      .regex(/[A-Z]/, 'Must include an uppercase letter.')
      .regex(/\d/, 'Must include a number.')
      .regex(/[\W_]/, 'Must include a special character.'),
    confirmPassword: z.string().trim()
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword']
  });

type AddCustomerFormType = z.infer<typeof AddCustomerSchema>;

const AddCustomerDialog = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<AddCustomerFormType>({
    resolver: zodResolver(AddCustomerSchema)
  });

  const onSubmit = async (data: AddCustomerFormType) => {
    try {
      setLoading(true);
      const response = await createContractorByAdmin({
        firstName: data.firstName,
        lastName: data.lastName,
        companyName: data.companyName,
        email: data.email,
        contactNumber: data.contactNumber,
        password: data.password
      });
      if (response.success) {
        toast.success(response.message);
        setOpen(false);
        reset();
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-9">
          <UserPlus className="sm:mr-2" size={16} />
          <span className="hidden sm:block">Add Customer</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-white sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Add Customer</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-2">
          <div className="grid grid-cols-2 gap-x-4">
            <InputFieldWithLabel
              label="First Name"
              placeholder="Enter first name"
              errorText={errors.firstName?.message}
              {...register('firstName')}
            />
            <InputFieldWithLabel
              label="Last Name"
              placeholder="Enter last name"
              errorText={errors.lastName?.message}
              {...register('lastName')}
            />
            <InputFieldWithLabel
              label="Company Name"
              placeholder="Enter company name"
              errorText={errors.companyName?.message}
              {...register('companyName')}
            />
            <InputFieldWithLabel
              label="Contact Number"
              placeholder="Enter 10-digit number"
              maxLength={10}
              errorText={errors.contactNumber?.message}
              {...register('contactNumber')}
            />
            <div className="col-span-2">
              <InputFieldWithLabel
                label="Email"
                placeholder="Enter email address"
                type="email"
                errorText={errors.email?.message}
                {...register('email')}
              />
            </div>
            <InputFieldWithLabel
              label="Password"
              placeholder="Enter password"
              type="password"
              errorText={errors.password?.message}
              {...register('password')}
            />
            <InputFieldWithLabel
              label="Confirm Password"
              placeholder="Confirm password"
              type="password"
              errorText={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <Button
              type="button"
              variant="outline"
              className="h-9"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="h-9 min-w-32">
              {loading ? <ButtonSpinner /> : 'Create Customer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCustomerDialog;
