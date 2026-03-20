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
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import toast from 'react-hot-toast';
import InputFieldWithLabel from '@/components/inputs-fields/InputFieldWithLabel';
import { SubscribeToBlogSchema } from '@/validations/admin/add-blog';
import { SubscribeToBlogFormType } from '@/types/ehs.types';
import { addBlogSubscriberDetails } from '@/actions/admin/blog';
import { sendBlogSubscribedEmail } from '@/actions/email';

const BlogSubscribeModal = () => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<SubscribeToBlogFormType>({
    resolver: zodResolver(SubscribeToBlogSchema),
    defaultValues: { email: '' }
  });

  const onSubmit = async (data: SubscribeToBlogFormType) => {
    setLoading(true);
    try {
      const res = await addBlogSubscriberDetails(data.email);
      if (res.success) {
        setLoading(false);
        toast.success(res.message);
        reset();
        setOpen(false);
        const emailRes = await sendBlogSubscribedEmail(data.email);

        if (!emailRes.success) {
          toast.error(emailRes.message);
        } else {
          toast.success(emailRes.message);
        }
      } else {
        setLoading(false);
        toast.error(res.message);
      }
    } catch (error) {
      setLoading(false);
      console.error('Unexpected error:', error);
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={isOpen => {
        setOpen(isOpen);
        if (isOpen) reset();
      }}
    >
      <DialogTrigger asChild>
        <button className="bg-primary rounded-md px-4 sm:px-6 py-2 text-white font-extrabold text-sm sm:text-base cursor-pointer">
          SUBSCRIBE TO SAFEZY BLOGS
        </button>
      </DialogTrigger>

      <DialogContent
        className="w-[calc(100vw-2rem)] sm:w-full
          border-0 shadow-2xl rounded-xl p-4 sm:p-6 bg-white"
        onCloseClick={() => reset()}
      >
        <DialogHeader className="pr-6">
          <DialogTitle>Subscribe to Safezy Blogs</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <InputFieldWithLabel
            label="Email Address"
            type="text"
            required
            placeholder="Enter your email..."
            errorText={errors.email?.message}
            {...register('email')}
          />

          <DialogFooter className="justify-center gap-2 sm:gap-0 sm:justify-end">
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
              className="h-9 lg:min-w-32"
              disabled={loading}
            >
              {loading ? 'Subscribing...' : 'Subscribe'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BlogSubscribeModal;
