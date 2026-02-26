'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputFieldWithLabel from '@/components/inputs-fields/InputFieldWithLabel';
import { AddBlogFormType, AddBlogType } from '@/types/ehs.types';
import { BlogType } from '@/types/index.types';
import { deleteFile, uploadFile } from '@/utils';
import { AppRoutes } from '@/constants/AppRoutes';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { formats, modules } from '@/constants/editor';
import { AddBlogSchema } from '@/validations/admin/add-blog';
import { addBlogDetails, updateBlogDetails } from '@/actions/admin/blog';
import { sendNewBlogEmail } from '@/actions/email';

const BlogAddUpdateSection = ({ blogDetails }: { blogDetails?: BlogType }) => {
  const isUpdate = Boolean(blogDetails);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [longDescContent, setLongDescContent] = useState(
    blogDetails?.long_description ?? ''
  );

  const existingFileName = blogDetails?.image_url
    ? blogDetails.image_url.split('/').pop()
    : '';

  const getOriginalFileName = (fileName: string) => {
    return fileName.split('_').slice(1).join('_');
  };

  const originalFileName = existingFileName
    ? getOriginalFileName(existingFileName as string)
    : '';

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<AddBlogFormType>({
    resolver: zodResolver(AddBlogSchema),
    defaultValues: {
      title: blogDetails?.title ?? '',
      description: blogDetails?.description ?? '',
      long_description: blogDetails?.long_description ?? ''
    }
  });

  useEffect(() => {
    setValue('long_description', longDescContent);
  }, [longDescContent, setValue]);

  const onSubmit = async (data: AddBlogFormType) => {
    try {
      if (isUpdate && blogDetails) {
        setLoading(true);

        let newImageUrl = blogDetails.image_url ?? '';

        if (data.image_url) {
          try {
            newImageUrl = await uploadFile(data.image_url, 'blogs', 'images');

            if (blogDetails.image_url) {
              await deleteFile(blogDetails.image_url, 'blogs', 'images');
            }
          } catch (error) {
            setError('image_url', { message: error.message });
            throw error;
          }
        }

        const submitData: AddBlogType = {
          title: data.title,
          description: data.description,
          long_description: longDescContent,
          image_url: newImageUrl
        };

        const response = await updateBlogDetails(submitData, blogDetails.id);

        if (response.success) {
          toast.success(response.message);
          router.push(AppRoutes.ADMIN_BLOG);
        } else {
          toast.error(response.message);
        }

        return;
      }

      // Add flow
      let uploadedImageUrl = '';

      if (data.image_url) {
        try {
          uploadedImageUrl = await uploadFile(
            data.image_url,
            'blogs',
            'images'
          );
        } catch (error) {
          setError('image_url', { message: error.message });
          throw error;
        }
      }

      const submitData: AddBlogType = {
        title: data.title,
        description: data.description,
        long_description: data.long_description,
        image_url: uploadedImageUrl
      };

      const response = await addBlogDetails(submitData);

      if (response.success) {
        toast.success(response.message);
        reset();
        setLongDescContent('');
        router.push(AppRoutes.ADMIN_BLOG);

        if (response.blog) {
          const { id, title, image_url } = response.blog;
          const emailRes = await sendNewBlogEmail(id, title, image_url);
          if (emailRes.success) {
            toast.success(emailRes.message);
          } else {
            toast.error(emailRes.message);
          }
        }
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Error saving blog details:', error);
      toast.error('An unexpected error occurred while saving blog details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid lg:grid-cols-2 lg:gap-x-4 gap-x-8">
        <div className="space-y-4">
          <InputFieldWithLabel
            label="Title"
            errorText={errors.title?.message}
            required
            {...register('title')}
          />

          <InputFieldWithLabel
            label="Description"
            errorText={errors.description?.message}
            required
            {...register('description')}
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="font-medium">Upload Image</label>
            <Input
              type="file"
              accept="image/*"
              {...register('image_url')}
              className="file:p-[5px] file:mb-1 file:rounded-lg mt-2 file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
            {isUpdate && originalFileName && (
              <p className="text-sm mt-1">
                Existing File: <strong>{originalFileName}</strong>
              </p>
            )}
            {errors.image_url && (
              <p className="text-sm text-red-500">{errors.image_url.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-sm">
        <label className="font-medium">Long Description</label>
        <ReactQuill
          theme="snow"
          modules={modules}
          formats={formats}
          value={longDescContent}
          onChange={setLongDescContent}
          className="rounded-md mt-2 text-black"
          style={{ color: 'black' }}
        />
        {errors.long_description && (
          <p className="text-sm text-red-500">
            {errors.long_description.message}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Button
          type="submit"
          disabled={loading || isSubmitting}
          className="min-w-32"
        >
          {loading || isSubmitting
            ? isUpdate
              ? 'Updating...'
              : 'Adding...'
            : isUpdate
              ? 'Update Blog'
              : 'Add Blog'}
        </Button>
      </div>
    </form>
  );
};

export default BlogAddUpdateSection;
