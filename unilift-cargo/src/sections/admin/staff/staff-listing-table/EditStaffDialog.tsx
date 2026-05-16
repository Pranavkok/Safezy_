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

import { updateStaffUser, StaffMember } from '@/actions/admin/staff';

const EditStaffSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  contactNumber: z
    .string()
    .length(10, 'Contact number must be exactly 10 digits')
    .regex(/^\d+$/, 'Contact number must contain only digits'),
  role: z.enum(['manager', 'safety_officer'], {
    required_error: 'Please select a role'
  })
});

type EditStaffFormType = z.infer<typeof EditStaffSchema>;

interface Props {
  staff: StaffMember;
}

const EditStaffDialog = ({ staff }: Props) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<EditStaffFormType>({
    resolver: zodResolver(EditStaffSchema),
    defaultValues: {
      firstName: staff.first_name,
      lastName: staff.last_name,
      contactNumber: staff.contact_number,
      role: staff.role
    }
  });

  const onSubmit = async (data: EditStaffFormType) => {
    try {
      setLoading(true);
      const response = await updateStaffUser({ id: String(staff.id), ...data });
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
        firstName: staff.first_name,
        lastName: staff.last_name,
        contactNumber: staff.contact_number,
        role: staff.role
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
          <DialogTitle>Edit Staff Member</DialogTitle>
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

            <div className="flex flex-col gap-1 mb-4">
              <label className="text-sm font-medium text-gray-700">Role</label>
              <select
                {...register('role')}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="manager">Manager</option>
                <option value="safety_officer">Safety Officer</option>
              </select>
              {errors.role && (
                <p className="text-xs text-red-500">{errors.role.message}</p>
              )}
            </div>
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

export default EditStaffDialog;
