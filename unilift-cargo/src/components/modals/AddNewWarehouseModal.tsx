'use client';

import { useForm } from 'react-hook-form';
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
import { AddWarehouseSchema } from '@/validations/admin/add-warehouse';
import { AddWarehouseType } from '@/types/warehouse.types';
import { sendSignupWarehouse } from '@/actions/email';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/constants';

type FieldType = {
  label: string;
  name: keyof AddWarehouseType;
  type: 'text' | 'email' | 'tel';
  required: boolean;
};

const warehouseFields: FieldType[] = [
  { label: 'Store Email', name: 'storeEmail', type: 'email', required: true }
];

const AddNewWarehouseModal = () => {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<AddWarehouseType>({
    resolver: zodResolver(AddWarehouseSchema)
  });

  const onSubmit = async (data: AddWarehouseType) => {
    setLoading(true);
    try {
      const res = await sendSignupWarehouse(data.storeEmail);

      if (res.success) {
        toast.success(SUCCESS_MESSAGES.SIGNUP_WAREHOUSE);
        setIsOpen(false);
        reset();
      }
    } catch (error) {
      toast.error(ERROR_MESSAGES.WAREHOUSE_NOT_ADDED);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)}>
          <Plus className=" w-5 h-5 sm:mr-2" />
          <span className="hidden sm:block">Add new warehouse</span>
        </Button>
      </DialogTrigger>

      <DialogContent
        className="bg-white"
        onInteractOutside={e => e.preventDefault()}
        onCloseClick={() => reset()}
      >
        <DialogHeader>
          <DialogTitle>Warehouse Email</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="">
            {warehouseFields.map(field => (
              <InputFieldWithLabel
                key={field.name}
                label={field.label}
                type={field.type}
                required={field.required}
                errorText={errors[field.name]?.message as string}
                {...register(field.name)}
              />
            ))}
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
                  <span className="loader mr-2" /> Saving...
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

export default AddNewWarehouseModal;
