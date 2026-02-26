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
import { Plus } from 'lucide-react';
import InputFieldWithLabel from '../inputs-fields/InputFieldWithLabel';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { AddEmployeeType } from '@/types/employee.types';
import { AddEmployeeSchema } from '@/validations/contractor/add-employee';
import SelectWithLabel from '../inputs-fields/SelectWithLabel';
import { useQuery } from '@tanstack/react-query';
import { getWorksiteOptions } from '@/actions/contractor/worksite';
import { addEmployee } from '@/actions/contractor/employee';

const AddNewEmployeeModal = () => {
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
  } = useForm<AddEmployeeType>({
    resolver: zodResolver(AddEmployeeSchema)
  });

  const onSubmit = async (data: AddEmployeeType) => {
    setLoading(true);
    try {
      const res = await addEmployee(data);
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
        <Button onClick={() => setIsOpen(true)}>
          <Plus className=" w-5 h-5 sm:mr-2" />
          <span className="">Add new employee</span>
        </Button>
      </DialogTrigger>

      <DialogContent
        className="bg-white"
        onInteractOutside={e => e.preventDefault()}
        onCloseClick={() => reset()}
      >
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
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
              type="text"
              label="Department"
              {...register('department')}
            />
            <InputFieldWithLabel
              type="text"
              label="Plant"
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
                  <span className="loader mr-2" /> Adding...
                </span>
              ) : (
                'Add'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddNewEmployeeModal;
