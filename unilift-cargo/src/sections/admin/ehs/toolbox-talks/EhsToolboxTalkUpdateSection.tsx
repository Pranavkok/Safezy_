'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputFieldWithLabel from '@/components/inputs-fields/InputFieldWithLabel';
import { AddToolboxTalkSchema } from '@/validations/admin/add-toolbox-talk';
import { updateToolboxTalkType } from '@/types/ehs.types';
import { updateToolboxTalkDetails } from '@/actions/admin/ehs/toolbox-talk';
import { deleteFile, uploadFile } from '@/utils';
import { ToolboxTalkType } from '@/types/index.types';
import { AppRoutes } from '@/constants/AppRoutes';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { formats, modules } from '@/constants/editor';

const ToolboxTalkDetailsUpdateSection = ({
  toolboxDetails
}: {
  toolboxDetails: ToolboxTalkType;
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [editorContent, setEditorContent] = useState(
    toolboxDetails.description ?? ''
  );
  const [summarizeContent, setSummarizeContent] = useState(
    toolboxDetails.summarized ?? ''
  );

  const existingFileName = toolboxDetails.pdf_url
    ? toolboxDetails.pdf_url.split('/').pop()
    : '';

  const getOriginalFileName = (fileName: string) => {
    return fileName.split('_').slice(1).join('_');
  };

  const originalFileName = getOriginalFileName(existingFileName as string);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors }
  } = useForm<updateToolboxTalkType>({
    resolver: zodResolver(AddToolboxTalkSchema),
    defaultValues: {
      topic_name: toolboxDetails.topic_name,
      description: toolboxDetails.description ?? '',
      summarize: toolboxDetails.summarized ?? ''
    }
  });

  useEffect(() => {
    setValue('description', editorContent);
    setValue('summarize', summarizeContent);
  }, [editorContent, summarizeContent, setValue]);

  const onSubmit = async (data: updateToolboxTalkType) => {
    try {
      setLoading(true);
      let newPdfUrl = toolboxDetails.pdf_url;

      if (data.pdf_url) {
        try {
          newPdfUrl = await uploadFile(
            data.pdf_url,
            'toolbox_talk_pdfs',
            'pdfs'
          );

          if (toolboxDetails.pdf_url) {
            await deleteFile(
              toolboxDetails.pdf_url,
              'toolbox_talk_pdfs',
              'pdfs'
            );
          }
        } catch (error) {
          setError('pdf_url', { message: error.message });
          throw error;
        }
      }

      const submitData = {
        ...data,
        pdf_url: newPdfUrl as string,
        description: editorContent,
        summarize: summarizeContent
      };
      const response = await updateToolboxTalkDetails(
        submitData,
        toolboxDetails.id
      );

      if (response.success) {
        toast.success(response.message);
        router.push(AppRoutes.ADMIN_EHS_TOOLBOX_TALK_LISTING);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Error updating toolbox talk details:', error);
      toast.error(
        'An unexpected error occurred while updating toolbox talk details.'
      );
    } finally {
      setLoading(false);
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
          <div>
            <label className="font-medium">Upload Image</label>
            <Input
              type="file"
              accept="image/*"
              {...register('pdf_url')}
              className="file:p-[5px] file:mb-1 file:rounded-lg mt-2 file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
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
          modules={modules}
          formats={formats}
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
        <Button type="submit" disabled={loading} className="min-w-32">
          {loading ? 'Updating...' : 'Update Topic'}
        </Button>
      </div>
    </form>
  );
};

export default ToolboxTalkDetailsUpdateSection;
