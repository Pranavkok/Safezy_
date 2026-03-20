'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import InputFieldWithLabel from '@/components/inputs-fields/InputFieldWithLabel';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { EhsNewsType } from '@/types/index.types';
import { updateEhsNews } from '@/actions/admin/ehs/news';
import TextAreaWithLabel from '@/components/inputs-fields/TextareaWithLabel';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AppRoutes } from '@/constants/AppRoutes';
import ConfirmDeleteNews from './ConfirmDeleteNews';
import Image from 'next/image';

export const EhsNewsFormSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  link: z.string().url('Please enter a valid URL'),
  image: z.string().url('Please enter a valid image URL').optional()
});

export type EhsNewsFormType = z.infer<typeof EhsNewsFormSchema>;

type EhsAddUpdateSectionProps = {
  ehsNews: EhsNewsType;
};

const EhsAddUpdateSection = ({ ehsNews }: EhsAddUpdateSectionProps) => {
  const [updateLoading, setUpdateLoading] = useState(false);

  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<EhsNewsFormType>({
    resolver: zodResolver(EhsNewsFormSchema),
    defaultValues: {
      link: ehsNews?.preview_url ?? '',
      title: ehsNews?.title ?? '',
      description: ehsNews?.description ?? '',
      image: ehsNews?.image_url ?? ''
    }
  });

  const imageUrl = watch('image');

  const handleFormSubmit = async (data: EhsNewsFormType) => {
    setUpdateLoading(true);

    try {
      const res = await updateEhsNews(ehsNews.id, data);

      if (res.success) {
        toast.success(`EHS News updated successfully`);
        router.push(AppRoutes.ADMIN_EHS_NEWS_LISTING);
      } else {
        toast.error(`Failed to update EHS News`);
      }
    } catch (error) {
      toast.error(`Failed to update EHS News`);
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div className="mx-auto">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
          <div>
            <InputFieldWithLabel
              type="text"
              label="Preview URL"
              errorText={errors.link?.message}
              required
              {...register('link')}
              disabled
              className="w-full"
            />

            <InputFieldWithLabel
              type="text"
              label="Title"
              errorText={errors.title?.message}
              required
              {...register('title')}
              className="w-full"
            />

            <TextAreaWithLabel
              label="Description"
              errorText={errors.description?.message}
              required
              {...register('description')}
              rows={5}
              className="w-full"
            />

            <InputFieldWithLabel
              type="url"
              label="Image URL"
              errorText={errors.image?.message}
              {...register('image')}
              className="w-full"
            />
          </div>

          <div>
            <p className="block text-sm font-medium text-gray-700 mb-3">
              Image Preview
            </p>
            {imageUrl ? (
              <div className="relative rounded-lg overflow-hidden border border-gray-200">
                <Image
                  width={1024}
                  height={1024}
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-[400px] object-contain bg-gray-50"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500">
                  Enter a valid image URL to preview
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4 items-center pt-6">
          <ConfirmDeleteNews id={ehsNews.id} />

          <Button
            type="submit"
            size="sm"
            className="capitalize"
            disabled={updateLoading}
          >
            {updateLoading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </span>
            ) : (
              'Publish News'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EhsAddUpdateSection;
