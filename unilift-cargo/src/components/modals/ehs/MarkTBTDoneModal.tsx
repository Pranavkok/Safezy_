'use client';

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
import { addToolboxUserDetails } from '@/actions/admin/ehs/toolbox-talk';
import { addToolboxUserType } from '@/types/ehs.types';
import { AddToolboxTalkUserSchema } from '@/validations/admin/add-toolbox-talk';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { uploadMultipleFiles } from '@/utils';
import { useUser } from '@/context/UserContext';
import InputFieldWithLabel from '@/components/inputs-fields/InputFieldWithLabel';
import CustomRating from '@/components/CustomRating';

const MarkTBTDoneModal = ({
  toolboxTalkId,
  toolboxTopic
}: {
  toolboxTalkId: number;
  toolboxTopic: string;
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [rating, setRating] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<addToolboxUserType>({
    resolver: zodResolver(AddToolboxTalkUserSchema)
  });

  const user = useUser();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  const onSubmit = async (data: addToolboxUserType) => {
    setLoading(true);

    try {
      const uploadedImages = await uploadMultipleFiles(
        selectedFiles,
        'product_images',
        'images'
      );

      const imageUrls = uploadedImages.map(img => ({
        publicUrl: img.publicUrl
      }));

      const res = await addToolboxUserDetails(
        data,
        imageUrls,
        toolboxTalkId,
        rating
      );

      const firstName = user.firstName as string;
      const lastName = user.lastName as string;
      const bestPerformer = res.data?.bestPerformer as string;

      const formData = new FormData();
      formData.append('superior_email', data.superior_email);
      formData.append('topicName', toolboxTopic);
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('bestPerformer', bestPerformer);
      selectedFiles.forEach(file => formData.append('file', file));

      if (res?.success) {
        const result = await fetch('/api/send-email', {
          method: 'POST',
          body: formData
        });

        if (result.ok) {
          toast.success(res?.message);
          reset();
          setSelectedFiles([]);
        } else {
          toast.error('Failed to send email');
        }
      } else {
        toast.error(res?.message || 'Failed to save details');
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error('Could not complete the process');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="bg-primary rounded-md px-4 sm:px-6 py-2  text-white font-extrabold text-xs sm:text-sm md:text-base">
          MARK AS TBT DONE
        </button>
      </DialogTrigger>
      <DialogContent
        className="bg-white"
        onInteractOutside={e => e.preventDefault()}
        onCloseClick={() => reset()}
      >
        <DialogHeader>
          <DialogTitle className="font-bold text-xl">Confirmation</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <InputFieldWithLabel
            label="Add Superior's Email"
            type="email"
            required
            errorText={errors.superior_email?.message as string}
            {...register('superior_email')}
          />

          <InputFieldWithLabel
            label="Best Performer's Name"
            type="text"
            required
            errorText={errors.best_performer?.message as string}
            {...register('best_performer')}
          />

          <InputFieldWithLabel
            label="Upload Attendance Sheet"
            type="file"
            multiple
            accept="image/*"
            required={false}
            onChange={handleFileChange}
          />

          {selectedFiles.length > 0 && (
            <ul className="mt-2 text-sm text-gray-700">
              {selectedFiles.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          )}
          <div className="space-y-2">
            <label>Rate this toolbox talk</label>
            <CustomRating
              initialRating={rating}
              onRatingChange={handleRatingChange}
              size={40}
            />
          </div>

          <DialogFooter className="justify-center sm:justify-end">
            <DialogClose asChild>
              <Button
                className="h-9 lg:w-32 bg-white"
                variant="outline"
                onClick={() => {
                  reset();
                  setSelectedFiles([]);
                }}
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
                  <span className="loader mr-2" /> Submitting...
                </span>
              ) : (
                'Submit'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MarkTBTDoneModal;
