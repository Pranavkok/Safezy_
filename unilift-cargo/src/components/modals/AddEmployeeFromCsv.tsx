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
import { useState } from 'react';
import InputFieldWithLabel from '../inputs-fields/InputFieldWithLabel';
import SelectWithLabel from '../inputs-fields/SelectWithLabel';
import { useQuery } from '@tanstack/react-query';
import { getWorksiteOptions } from '@/actions/contractor/worksite';
import { z } from 'zod';
import Papa from 'papaparse';
import toast from 'react-hot-toast';
import { addEmployeesFromCSV } from '@/actions/contractor/employee';
import { ERROR_MESSAGES } from '@/constants/constants';

export interface EmployeeDataProps {
  name: string;
  contact_number: string;
  worksite_id: string;
  user_id: string;
}

export const AddEmployeeCsvSchema = z.object({
  worksite_id: z.string().min(1, 'Worksite is required.'),
  csv_file: z
    .any()
    .refine(file => file && file.length > 0, {
      message: 'CSV file is required.'
    })
    .refine(
      file => {
        if (!file || file.length === 0) return false;
        return (
          file[0]?.type === 'text/csv' ||
          file[0]?.name?.toLowerCase().endsWith('.csv')
        );
      },
      {
        message: 'Only CSV files are allowed.'
      }
    )
});

export type AddEmployeeCsvType = z.infer<typeof AddEmployeeCsvSchema>;

const AddEmployeeFromCsv = () => {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    register,
    formState: { errors }
  } = useForm<AddEmployeeCsvType>({
    resolver: zodResolver(AddEmployeeCsvSchema),
    mode: 'onSubmit'
  });

  const { isPending, data: worksSiteOptions = [] } = useQuery({
    queryKey: ['worksiteOptions', isOpen],
    queryFn: () => getWorksiteOptions()
  });

  const onSubmit = async (data: AddEmployeeCsvType) => {
    setLoading(true);
    try {
      if (data.csv_file && data.csv_file[0]) {
        const reader = new FileReader();
        reader.onloadend = async ({ target }) => {
          const csv = Papa.parse<{ name: string; contact_number: string }>(
            target?.result as string,
            { header: true }
          );
          const parsedData = csv.data as Array<{
            name: string;
            contact_number: string;
            designation: string;
            department: string;
            plant: string;
          }>;

          const result = await addEmployeesFromCSV(
            parsedData,
            data.worksite_id
          );

          if (!result.success) {
            toast.error(
              result?.message || ERROR_MESSAGES.FAILED_ADDING_CSV_DATA
            );
          } else {
            toast.success(result.message);
          }
          setIsOpen(false);
        };
        reader.readAsText(data.csv_file[0]);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(ERROR_MESSAGES.FAILED_ADDING_CSV_DATA);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)}>
          <Plus className="w-5 h-5 sm:mr-2" />
          <span className="">Upload CSV</span>
        </Button>
      </DialogTrigger>

      <DialogContent
        className="bg-white"
        onInteractOutside={e => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Upload Your CSV:</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <Controller
              control={control}
              name="worksite_id"
              render={({ field }) => (
                <SelectWithLabel
                  label="Select Worksite"
                  name="site_name"
                  options={worksSiteOptions}
                  errorText={errors.worksite_id?.message}
                  onChange={field.onChange}
                  value={field.value}
                  loading={isPending}
                  required
                />
              )}
            />

            <InputFieldWithLabel
              label="Select CSV File"
              type="file"
              accept=".csv"
              errorText={errors.csv_file?.message as string}
              {...register('csv_file')}
              required
            />
          </div>

          <DialogFooter className="justify-center sm:justify-end">
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
                  <span className="loader mr-2" /> Uploading...
                </span>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeFromCsv;
