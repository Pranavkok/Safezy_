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
import { Sparkles } from 'lucide-react';

const EhsToolboxTalkAddSection = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<addToolboxTalkType>({
    resolver: zodResolver(AddToolboxTalkSchema),
    defaultValues: { description: '', summarize: '' }
  });

  const [editorContent, setEditorContent] = useState('');
  const [summarizeContent, setSummarizeContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [responseLength, setResponseLength] = useState<'short' | 'medium' | 'long'>('medium');

  const topicName = watch('topic_name');
  const selectedFile = watch('pdf_url') as unknown as FileList | null;

  useEffect(() => {
    setValue('description', editorContent);
    setValue('summarize', summarizeContent);
  }, [editorContent, summarizeContent, setValue]);

  const handleGenerate = async () => {
    if (!topicName?.trim()) {
      toast.error('Please enter a topic name first.');
      return;
    }

    try {
      setIsGenerating(true);
      toast.loading('Generating content with Safezy...', { id: 'generate-toolbox' });

      // Read selected image as base64 if available
      let image_base64: string | undefined;
      let image_mime_type: string | undefined;
      const file = selectedFile?.[0];
      if (file) {
        await new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            const [header, data] = dataUrl.split(',');
            image_mime_type = header.replace('data:', '').replace(';base64', '');
            image_base64 = data;
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }

      const response = await fetch('/api/generate-toolbox-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicName, length: responseLength, image_base64, image_mime_type })
      });

      const result = await response.json();
      toast.dismiss('generate-toolbox');

      if (result.success) {
        setEditorContent(result.data.description);
        setSummarizeContent(result.data.summarize);
        toast.success('Content generated! Review and edit as needed.');
      } else {
        toast.error(result.error || 'Failed to generate content.');
      }
    } catch {
      toast.dismiss('generate-toolbox');
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

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
          <div>
            <InputFieldWithLabel
              label="Topic Name"
              errorText={errors.topic_name?.message}
              required
              {...register('topic_name')}
            />
            <div className="mt-2 space-y-2">
              <label className="text-sm font-medium text-gray-700">Response Length</label>
              <div className="flex gap-2">
                {(['short', 'medium', 'long'] as const).map(len => (
                  <button
                    key={len}
                    type="button"
                    onClick={() => setResponseLength(len)}
                    className={`flex-1 py-1.5 rounded-md text-xs font-semibold border capitalize transition-colors ${
                      responseLength === len
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
                    }`}
                  >
                    {len}
                  </button>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleGenerate}
                disabled={isGenerating || !topicName?.trim()}
                className="w-full flex items-center gap-2 text-primary border-primary hover:bg-primary hover:text-white"
              >
                <Sparkles className="w-4 h-4" />
                {isGenerating ? 'Generating...' : 'Generate with AI'}
              </Button>
            </div>
          </div>
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
