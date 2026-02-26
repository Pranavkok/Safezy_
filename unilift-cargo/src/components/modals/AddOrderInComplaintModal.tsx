'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import toast from 'react-hot-toast';
import { AddComplaintSchema } from '@/validations/contractor/add-complaint';
import { addComplaintType } from '@/types/complaint.types';
import { uploadFile } from '@/utils';
import {
  addComplaint,
  addOrderInComplaint
} from '@/actions/contractor/complaint';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/constants';
import TextAreaWithLabel from '../inputs-fields/TextareaWithLabel';

type FieldType = {
  label: string;
  name: keyof addComplaintType;
  type: 'text' | 'email' | 'tel' | 'file';
  required: boolean;
};

const complaintFields: FieldType[] = [
  { label: 'Upload Image', name: 'image', type: 'file', required: false },
  { label: 'Description', name: 'description', type: 'text', required: true }
];

const AddOrderInComplaintModal = ({
  order_id,
  isOpen,
  setIsOpen,
  onComplaintSuccess
}: {
  order_id: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onComplaintSuccess: (orderId: string) => void;
}) => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError
  } = useForm<addComplaintType>({
    resolver: zodResolver(AddComplaintSchema)
  });

  const onSubmit = async (data: addComplaintType) => {
    setLoading(true);
    try {
      let imageUrl = '';

      if (data.image?.[0]) {
        try {
          imageUrl = await uploadFile(
            data.image[0],
            'complaint_images',
            'images'
          );
        } catch (error) {
          setError('image', { message: error.message });
          throw error;
        }
      }

      const response = await addComplaint({
        ...data,
        image: imageUrl,
        order_id
      });

      if (response.success) {
        const orderUpdateResponse = await addOrderInComplaint(order_id);

        if (orderUpdateResponse.success) {
          toast.success(SUCCESS_MESSAGES.COMPLAINT_ADDED);
          setIsOpen(false);
          reset();

          onComplaintSuccess(order_id);
        } else {
          toast.error(orderUpdateResponse.message);
        }
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Error registering complaint:', error);
      toast.error(error.message || ERROR_MESSAGES.UNEXPECTED_ERROR);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={state => setIsOpen(state)}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Register a Complaint</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-2">
            {complaintFields.map(field =>
              field.type === 'file' ? (
                <div key={field.name} className="mb-2">
                  <label htmlFor={field.name} className="text-l">
                    {field.label}
                  </label>
                  <input
                    id={field.name}
                    type="file"
                    {...register(field.name)}
                    className="mt-1 block w-full text-sm"
                  />
                  {errors[field.name] && (
                    <p className="text-sm text-red-500">
                      {'An error occurred'}
                    </p>
                  )}
                </div>
              ) : (
                <TextAreaWithLabel
                  key={field.name}
                  label={field.label}
                  type={field.type}
                  required={field.required}
                  errorText={errors[field.name]?.message as string}
                  {...register(field.name)}
                />
              )
            )}
          </div>

          <DialogFooter className="justify-center sm:justify-end">
            <DialogClose asChild>
              <Button
                className="h-9 lg:w-32 bg-white"
                variant="outline"
                onClick={() => setIsOpen(false)}
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

export default AddOrderInComplaintModal;
