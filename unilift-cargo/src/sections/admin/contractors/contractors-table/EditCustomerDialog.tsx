'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Pencil } from 'lucide-react';

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

import { updateContractor, FetchContractorType } from '@/actions/admin/contractor';

const EditCustomerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  contactNumber: z
    .string()
    .length(10, 'Contact number must be exactly 10 digits')
    .regex(/^\d+$/, 'Contact number must contain only digits')
});

type EditCustomerFormType = z.infer<typeof EditCustomerSchema>;

interface Props {
  customer: FetchContractorType;
}

const EditCustomerDialog = ({ customer }: Props) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<EditCustomerFormType>({
    resolver: zodResolver(EditCustomerSchema),
    defaultValues: {
      firstName: customer.first_name,
      lastName: customer.last_name,
      contactNumber: customer.contact_number
    }
  });

  const onSubmit = async (data: EditCustomerFormType) => {
    try {
      setLoading(true);
      const response = await updateContractor({ id: customer.id, ...data });
      if (response.success) {
        toast.success(response.message);
        setOpen(false);
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
    if (val) {
      reset({
        firstName: customer.first_name,
        lastName: customer.last_name,
        contactNumber: customer.contact_number
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors">
          <Pencil size={15} />
        </button>
      </DialogTrigger>

      <DialogContent className="bg-white sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
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
              label="Contact Number"
              placeholder="Enter contact number"
              maxLength={10}
              errorText={errors.contactNumber?.message}
              {...register('contactNumber')}
            />
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <Button
              type="button"
              variant="outline"
              className="h-9"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="h-9 min-w-28">
              {loading ? <ButtonSpinner /> : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCustomerDialog;
