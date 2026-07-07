'use client';

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputFieldWithLabel from '@/components/inputs-fields/InputFieldWithLabel';
import { AddToolboxTalkSchema } from '@/validations/admin/add-toolbox-talk';
import { updateToolboxTalkType, updateToolboxType } from '@/types/ehs.types';
import { updateToolboxTalkDetails } from '@/actions/admin/ehs/toolbox-talk';
import { uploadMultipleFiles } from '@/utils';
import { ToolboxTalkType } from '@/types/index.types';
import { AppRoutes } from '@/constants/AppRoutes';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { formats, modules } from '@/constants/editor';
import {
  Images,
  ImagePlus,
  Loader2,
  Sparkles,
  Trash2,
  Upload,
  X
} from 'lucide-react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

const MAX_PREVIEW_THUMBNAILS = 4;

/** Parse pdf_url which may be a JSON array or a plain URL string */
const parsePdfUrl = (pdf_url: string | null | undefined): string[] => {
  if (!pdf_url) return [];
  try {
    const parsed = JSON.parse(pdf_url);
    if (Array.isArray(parsed)) return parsed as string[];
    return [pdf_url];
  } catch {
    return [pdf_url];
  }
};

const ToolboxTalkDetailsUpdateSection = ({
  toolboxDetails
}: {
  toolboxDetails: ToolboxTalkType;
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [responseLength, setResponseLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [isDragging, setIsDragging] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editorContent, setEditorContent] = useState(toolboxDetails.description ?? '');
  const [summarizeContent, setSummarizeContent] = useState(toolboxDetails.summarized ?? '');

  // Existing images parsed from pdf_url (JSON array or plain URL)
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(
    parsePdfUrl(toolboxDetails.pdf_url)
  );

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors }
  } = useForm<updateToolboxTalkType>({
    resolver: zodResolver(AddToolboxTalkSchema),
    defaultValues: {
      topic_name: toolboxDetails.topic_name,
      description: toolboxDetails.description ?? '',
      summarize: toolboxDetails.summarized ?? '',
      images: []
    }
  });

  const watchImages: File[] = watch('images') || [];
  const newImageCount = watchImages.length;
  const totalImageCount = existingImageUrls.length + newImageCount;

  useEffect(() => {
    setValue('description', editorContent);
    setValue('summarize', summarizeContent);
  }, [editorContent, summarizeContent, setValue]);

  // ── Image helpers ────────────────────────────────────────────────────────────

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const current = watchImages || [];
      setValue('images', [...current, ...Array.from(files)] as File[]);
    },
    [watchImages, setValue]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      addFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const handleDeleteNewImage = (idx: number) => {
    setValue(
      'images',
      watchImages.filter((_, i) => i !== idx) as File[]
    );
  };

  const handleDeleteExistingImage = (idx: number) => {
    setExistingImageUrls(prev => prev.filter((_, i) => i !== idx));
  };

  const visibleItems = [
    ...existingImageUrls.map(url => ({ type: 'existing' as const, url })),
    ...watchImages.map((f, i) => ({ type: 'new' as const, file: f, index: i }))
  ];
  const visibleThumbs = visibleItems.slice(0, MAX_PREVIEW_THUMBNAILS);
  const extraCount = totalImageCount - MAX_PREVIEW_THUMBNAILS;

  // ── AI generate ──────────────────────────────────────────────────────────────

  const handleGenerate = async () => {
    const topicName = toolboxDetails.topic_name;
    if (!topicName?.trim()) return;

    try {
      setIsGenerating(true);
      toast.loading('Generating content with Safezy...', { id: 'generate-toolbox' });

      const newFile = watchImages[0];
      let image_base64: string | undefined;
      let image_mime_type: string | undefined;
      let image_url: string | undefined;

      if (newFile) {
        await new Promise<void>(resolve => {
          const reader = new FileReader();
          reader.onload = e => {
            const dataUrl = e.target?.result as string;
            const [header, data] = dataUrl.split(',');
            image_mime_type = header.replace('data:', '').replace(';base64', '');
            image_base64 = data;
            resolve();
          };
          reader.readAsDataURL(newFile);
        });
      } else if (existingImageUrls[0]) {
        image_url = existingImageUrls[0];
      }

      const response = await fetch('/api/generate-toolbox-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicName, length: responseLength, image_base64, image_mime_type, image_url })
      });

      const result = await response.json();
      toast.dismiss('generate-toolbox');

      if (result.success) {
        setEditorContent(result.data.description);
        setSummarizeContent(result.data.summarize);
        toast.success('Content regenerated! Review and edit as needed.');
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

  // ── Submit ───────────────────────────────────────────────────────────────────

  const onSubmit = async (data: updateToolboxTalkType) => {
    try {
      setLoading(true);

      let newImageUrls: string[] = [];
      if (data.images && data.images.length > 0) {
        try {
          const uploaded = await uploadMultipleFiles(
            data.images,
            'toolbox_talk_pdfs',
            'images'
          );
          newImageUrls = uploaded.filter(r => r.publicUrl).map(r => r.publicUrl);
        } catch (error) {
          setError('images', { message: error.message });
          throw error;
        }
      }

      // Merge retained existing URLs with newly uploaded ones
      const allImageUrls = [...existingImageUrls, ...newImageUrls];

      const submitData: updateToolboxType = {
        topic_name: data.topic_name,
        description: editorContent,
        summarize: summarizeContent,
        image_urls: allImageUrls
      };

      const response = await updateToolboxTalkDetails(submitData, toolboxDetails.id);

      if (response.success) {
        toast.success(response.message);
        router.refresh();
        router.push(AppRoutes.ADMIN_EHS_TOOLBOX_TALK_LISTING);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error updating toolbox talk details:', error);
      toast.error('An unexpected error occurred while updating toolbox talk details.');
    } finally {
      setLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid lg:grid-cols-2 lg:gap-x-4 gap-x-8">
        {/* Left — Topic + AI generate */}
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
                disabled={isGenerating}
                className="w-full flex items-center gap-2 text-primary border-primary hover:bg-primary hover:text-white"
              >
                <Sparkles className="w-4 h-4" />
                {isGenerating ? 'Generating...' : 'Regenerate with Safezy'}
              </Button>
            </div>
          </div>
        </div>

        {/* Right — Multi-image upload */}
        <div className="space-y-2">
          <label className="font-medium text-sm">
            Upload Images
            <span className="ml-2 text-xs text-gray-400 font-normal">
              (JPG, PNG, WEBP · Max 5 MB each · Multiple allowed)
            </span>
          </label>

          {/* Hidden file input */}
          <Input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
          />

          {/* Drag-and-drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 py-6 px-4 select-none
              ${isDragging
                ? 'border-primary bg-primary/5 scale-[1.01]'
                : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
              }`}
          >
            <Upload className={`w-8 h-8 transition-colors ${isDragging ? 'text-primary' : 'text-gray-400'}`} />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                {isDragging ? 'Drop images here' : 'Drag & drop images or click to browse'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">You can select multiple images at once</p>
            </div>
          </div>

          {/* Thumbnail strip + View dialog */}
          {totalImageCount > 0 && (
            <div className="flex items-center gap-2 pt-1">
              <div className="flex items-center gap-1 flex-1 min-w-0">
                {visibleThumbs.map((item, i) => {
                  const src =
                    item.type === 'existing'
                      ? item.url
                      : URL.createObjectURL(item.file);
                  return (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-md overflow-hidden border border-gray-200 shrink-0 bg-gray-100"
                    >
                      <Image
                        width={40}
                        height={40}
                        src={src}
                        alt={`thumb-${i}`}
                        className="w-full h-full object-cover"
                        onLoad={() => { if (item.type === 'new') URL.revokeObjectURL(src); }}
                        onError={() => { if (item.type === 'new') URL.revokeObjectURL(src); }}
                      />
                    </div>
                  );
                })}
                {extraCount > 0 && (
                  <div className="w-10 h-10 rounded-md border border-gray-200 bg-gray-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-gray-500">+{extraCount}</span>
                  </div>
                )}
              </div>

              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button type="button" variant="secondary" size="sm" className="shrink-0 gap-1.5">
                    <Images className="w-4 h-4" />
                    View all ({totalImageCount})
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] bg-white">
                  <DialogHeader>
                    <DialogTitle>Images ({totalImageCount})</DialogTitle>
                  </DialogHeader>
                  <div className="flex items-center justify-end mb-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImagePlus className="mr-2 w-4 h-4" /> Add More
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[500px] overflow-y-auto">
                    {/* Existing images */}
                    {existingImageUrls.map((url, idx) => (
                      <div key={`existing-${idx}`} className="relative group">
                        <div className="aspect-square overflow-hidden rounded-xl shadow-md border">
                          <Image
                            width={200}
                            height={200}
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                            src={url}
                            alt={`Existing Image ${idx + 1}`}
                          />
                        </div>
                        <Button
                          className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full w-8 h-8 transition-all duration-300 shadow-md hover:shadow-lg"
                          title="Remove"
                          onClick={() => handleDeleteExistingImage(idx)}
                          type="button"
                        >
                          <Trash2 className="text-red-500 w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {/* New images */}
                    {watchImages.map((file, index) => {
                      const objectUrl = URL.createObjectURL(file);
                      return (
                        <div key={`new-${index}`} className="relative group">
                          <div className="aspect-square overflow-hidden rounded-xl shadow-md border">
                            <Image
                              width={200}
                              height={200}
                              className="w-full h-full object-cover transition-transform group-hover:scale-110"
                              src={objectUrl}
                              alt={`New Image ${index + 1}`}
                              onLoad={() => URL.revokeObjectURL(objectUrl)}
                              onError={() => URL.revokeObjectURL(objectUrl)}
                            />
                          </div>
                          <Button
                            className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full w-8 h-8 transition-all duration-300 shadow-md hover:shadow-lg"
                            title="Remove"
                            onClick={() => handleDeleteNewImage(index)}
                            type="button"
                          >
                            <Trash2 className="text-red-500 w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {errors.images && (
            <p className="text-sm text-red-500">{errors.images.message as string}</p>
          )}
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
