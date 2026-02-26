'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputFieldWithLabel from '@/components/inputs-fields/InputFieldWithLabel';
import { AddToolboxTalkSchema } from '@/validations/admin/add-toolbox-talk';
import { addToolboxTalkType, addToolboxType } from '@/types/ehs.types';
import { addToolboxTalkDetails } from '@/actions/admin/ehs/toolbox-talk';
import toast from 'react-hot-toast';
import { uploadFile } from '@/utils';
import { useRouter } from 'next/navigation';
import { AppRoutes } from '@/constants/AppRoutes';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { formats, modules } from '@/constants/editor';

const EhsToolboxTalkAddSection = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<addToolboxTalkType>({
    resolver: zodResolver(AddToolboxTalkSchema),
    defaultValues: { description: '', summarize: '' }
  });

  const [editorContent, setEditorContent] = useState('');
  const [summarizeContent, setSummarizeContent] = useState('');

  useEffect(() => {
    setValue('description', editorContent);
    setValue('summarize', summarizeContent);
  }, [editorContent, summarizeContent, setValue]);

  const onSubmit = async (data: addToolboxTalkType) => {
    try {
      let imageUrl = '';

      if (data.pdf_url) {
        try {
          imageUrl = await uploadFile(
            data.pdf_url,
            'toolbox_talk_pdfs',
            'pdfs'
          );
        } catch (error) {
          setError('pdf_url', { message: error.message });
          throw error;
        }
      }

      const submitData: addToolboxType = {
        topic_name: data.topic_name,
        description: data.description,
        summarize: data.summarize,
        pdf_url: imageUrl
      };

      const response = await addToolboxTalkDetails(submitData);

      if (response.success) {
        toast.success(response.message);
        reset();
        router.push(AppRoutes.ADMIN_EHS_TOOLBOX_TALK_LISTING);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Error adding toolbox talk details:', error);
      toast.error(
        'An unexpected error occurred while adding toolbox talk details.'
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid lg:grid-cols-2 lg:gap-x-4 gap-x-8">
        <div className="space-y-4">
          <InputFieldWithLabel
            label="Topic Name"
            errorText={errors.topic_name?.message}
            required
            {...register('topic_name')}
          />
        </div>

        <div className="space-y-4">
          {/* PDF Upload */}
          <div>
            <label className="font-medium">Upload Image</label>
            <Input
              type="file"
              accept="image/*"
              {...register('pdf_url')}
              className="file:p-[5px] file:mb-1 file:rounded-lg mt-2 file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
            {errors.pdf_url && (
              <p className="text-sm text-red-500">{errors.pdf_url.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-sm">
        {/* Text editor */}
        <label className="font-medium">Description</label>
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

      <div className="rounded-sm">
        {/* Text editor */}
        <label className="font-medium">Summarize</label>
        <ReactQuill
          modules={modules}
          formats={formats}
          theme="snow"
          value={summarizeContent}
          onChange={setSummarizeContent}
          className="rounded-md mt-2 text-black"
          style={{ color: 'black' }}
        />
        {errors.summarize && (
          <p className="text-sm text-red-500">{errors.summarize.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Button type="submit" disabled={isSubmitting} className="min-w-32">
          {isSubmitting ? 'Adding...' : 'Add Topic'}
        </Button>
      </div>
    </form>
  );
};

export default EhsToolboxTalkAddSection;
