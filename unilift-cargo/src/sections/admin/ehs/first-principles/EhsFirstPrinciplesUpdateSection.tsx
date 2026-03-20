'use client';

import { useState } from 'react';
import InputFieldWithLabel from '@/components/inputs-fields/InputFieldWithLabel';
import {
  addFirstPrinciplesDataType,
  addFirstPrinciplesType
} from '@/types/ehs.types';
import { addFirstPrinciplesSchema } from '@/validations/admin/add-first-principles';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { AppRoutes } from '@/constants/AppRoutes';
import { updateFirstPrinciples } from '@/actions/admin/ehs/first-principles';
import { deleteFile, uploadFile } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FirstPrinciplesType } from '@/types/index.types';
import ReactQuill from 'react-quill';
import { formats, modules } from '@/constants/editor';
import 'react-quill/dist/quill.snow.css';

const EHSFirstPrinciplesDetailsUpdateSection = ({
  principles
}: {
  principles: FirstPrinciplesType;
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [editorContent, setEditorContent] = useState(
    principles.description || ''
  );
  const existingFileName = principles.image_url
    ? principles.image_url.split('/').pop()
    : '';

  const getOriginalFileName = (fileName: string) => {
    return fileName.split('_').slice(1).join('_');
  };

  const originalFileName = getOriginalFileName(existingFileName as string);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors }
  } = useForm<addFirstPrinciplesType>({
    resolver: zodResolver(addFirstPrinciplesSchema),
    defaultValues: {
      title: principles.title ?? '',
      description: principles.description ?? ''
    }
  });

  const handleFormSubmit = async (data: addFirstPrinciplesType) => {
    setLoading(true);

    try {
      let newImageUrl = principles.image_url;

      if (data.image_url) {
        try {
          newImageUrl = await uploadFile(
            data.image_url,
            'toolbox_talk_pdfs',
            'pdfs'
          );

          if (principles.image_url) {
            await deleteFile(principles.image_url, 'toolbox_talk_pdfs', 'pdfs');
          }
        } catch (error) {
          setError('image_url', { message: error.message });
          throw error;
        }
      }
      const submittedData: addFirstPrinciplesDataType = {
        title: data.title,
        description: editorContent,
        image_url: newImageUrl as string
      };

      const res = await updateFirstPrinciples(submittedData, principles.id);

      if (res.success) {
        toast.success(res.message);
        reset();
        router.push(AppRoutes.ADMIN_EHS_FIRST_PRINCIPLES_LISTING);
      } else {
        toast.error(`Failed to update first principle`);
      }
    } catch (error) {
      toast.error(`Failed to update first principle`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid lg:grid-cols-2 lg:gap-x-4 gap-x-8">
        <div className="space-y-4">
          <InputFieldWithLabel
            label="Title"
            errorText={errors.title?.message}
            required
            {...register('title')}
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="font-medium">Upload PDF</label>
            <Input
              type="file"
              accept=".pdf"
              {...register('image_url')}
              className="file:p-[5px] file:rounded-lg mt-2 file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
            {existingFileName && (
              <p className="text-sm mt-1">
                Existing File: <strong>{originalFileName}</strong>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-sm">
        <label className="font-medium">Description</label>
        <ReactQuill
          theme="snow"
          formats={formats}
          modules={modules}
          value={editorContent}
          onChange={setEditorContent}
          className="rounded-md mt-2 text-black"
          style={{ color: 'black' }}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Button type="submit" disabled={loading} className="min-w-32">
          {loading ? 'Updating...' : 'Update Topic'}
        </Button>
      </div>
    </form>
  );
};

export default EHSFirstPrinciplesDetailsUpdateSection;
