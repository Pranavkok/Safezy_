'use client';

import { useEffect, useState } from 'react';
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
import { addFirstPrinciples } from '@/actions/admin/ehs/first-principles';
import { uploadFile } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ReactQuill from 'react-quill';
import { formats, modules } from '@/constants/editor';
import 'react-quill/dist/quill.snow.css';

const EHSFirstPrinciplesAddSection = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    reset,
    setValue,
    formState: { errors }
  } = useForm<addFirstPrinciplesType>({
    resolver: zodResolver(addFirstPrinciplesSchema)
  });

  const [editorContent, setEditorContent] = useState('');

  useEffect(() => {
    setValue('description', editorContent);
  }, [editorContent, setValue]);

  const handleFormSubmit = async (data: addFirstPrinciplesType) => {
    setLoading(true);

    try {
      let imageUrl = '';

      if (data.image_url) {
        try {
          imageUrl = await uploadFile(
            data.image_url,
            'toolbox_talk_pdfs',
            'pdfs'
          );
        } catch (error) {
          setError('image_url', { message: error.message });
          throw error;
        }
      }

      const submittedData: addFirstPrinciplesDataType = {
        title: data.title,
        description: data.description,
        image_url: imageUrl
      };

      const res = await addFirstPrinciples(submittedData);

      if (res.success) {
        toast.success(res.message);
        reset();
        router.push(AppRoutes.ADMIN_EHS_FIRST_PRINCIPLES_LISTING);
      } else {
        toast.error(`Failed to add first principles`);
      }
    } catch (error) {
      toast.error(`Failed to add first principles`);
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
          {/* PDF Upload */}
          <div>
            <label>Upload PDF</label>
            <Input
              type="file"
              accept=".pdf"
              {...register('image_url')}
              className="file:p-[5px] file:mb-1 file:rounded-lg mt-2 file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
            {errors.image_url && (
              <p className="text-sm text-red-500">{errors.image_url.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-sm">
        {/* Text editor */}
        <label>Description</label>
        <ReactQuill
          modules={modules}
          formats={formats}
          theme="snow"
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
          {loading ? 'Adding...' : 'Add Principle'}
        </Button>
      </div>
    </form>
  );
};

export default EHSFirstPrinciplesAddSection;
