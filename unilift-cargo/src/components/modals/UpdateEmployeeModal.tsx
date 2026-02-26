'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useState } from 'react';
import { UpdateEmployeeType } from '@/types/employee.types';
import { UpdateEmployeeSchema } from '@/validations/contractor/add-employee';
import { useQuery } from '@tanstack/react-query';
import { getWorksiteOptions } from '@/actions/contractor/worksite';
import { updateEmployee } from '@/actions/contractor/employee';
import { EmployeeWithWorksiteType } from '@/types/index.types';
import EditIcon from '@/components/svgs/EditIcon';
import SelectWithLabel from '../inputs-fields/SelectWithLabel';
import InputFieldWithLabel from '../inputs-fields/InputFieldWithLabel';
import toast from 'react-hot-toast';

const UpdateEmployeeModal = ({
  employeeDetails
}: {
  employeeDetails: EmployeeWithWorksiteType;
}) => {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const { isPending, data: worksSiteOptions = [] } = useQuery({
    queryKey: ['worksiteOptions', isOpen],
    queryFn: () => getWorksiteOptions()
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<UpdateEmployeeType>({
    resolver: zodResolver(UpdateEmployeeSchema),
    defaultValues: {
      name: employeeDetails.name,
      designation: employeeDetails.designation as string,
      contact_number: employeeDetails.contact_number,
      site_name: employeeDetails.worksite_id as string,
      department: employeeDetails.department || undefined,
      plant: employeeDetails.plant || undefined
    }
  });

  const onSubmit = async (data: UpdateEmployeeType) => {
    setLoading(true);
    try {
      const res = await updateEmployee(data, employeeDetails.id);
      if (res.success) {
        toast.success(res.message);
        reset();
        setIsOpen(false);
      }
    } catch (error) {
      toast.error('Failed to add warehouse.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="hover:bg-transparent" onClick={() => setIsOpen(true)}>
          <EditIcon className="fill-gray-400 hover:fill-primary w-4 h-4 transition-colors duration-300" />
        </div>
      </DialogTrigger>

      <DialogContent
        className="bg-white"
        onInteractOutside={e => e.preventDefault()}
        onCloseClick={() => reset()}
      >
        <DialogHeader>
          <DialogTitle>Update Employee Details</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="">
            <InputFieldWithLabel
              type="text"
              label="Employee Name"
              errorText={errors.name?.message}
              required
              {...register('name')}
            />
            <InputFieldWithLabel
              type="text"
              label="Employee Designation"
              errorText={errors.designation?.message}
              {...register('designation')}
            />
            <InputFieldWithLabel
              type="tel"
              label="Contact No."
              errorText={errors.contact_number?.message}
              maxLength={10}
              minLength={10}
              {...register('contact_number')}
            />
            <InputFieldWithLabel
              errorText={errors.department?.message}
              type="text"
              label="Department"
              {...register('department')}
            />
            <InputFieldWithLabel
              type="text"
              label="Plant"
              errorText={errors.plant?.message}
              {...register('plant')}
            />

            <Controller
              control={control}
              name="site_name"
              render={({ field }) => (
                <SelectWithLabel
                  label="Select Worksite"
                  name="site_name"
                  options={worksSiteOptions}
                  errorText={errors.site_name?.message}
                  onChange={field.onChange}
                  value={field.value}
                  loading={isPending}
                  required
                />
              )}
            />
          </div>

          <DialogFooter className="justify-center sm:justify-end ">
            <DialogClose asChild>
              <Button
                className="h-9 lg:w-32 bg-white"
                variant="outline"
                onClick={() => reset()}
                disabled={loading}
              >
                Cancel
              </Button>
            </DialogClose>

            <Button
              type="submit"
              className="text-sm capitalize h-9 lg:min-w-32"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <span className="loader mr-2" /> Updating...
                </span>
              ) : (
                'Update'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateEmployeeModal;
