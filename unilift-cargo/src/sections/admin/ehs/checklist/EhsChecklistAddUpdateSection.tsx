'use client';

import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import InputFieldWithLabel from '@/components/inputs-fields/InputFieldWithLabel';
import toast from 'react-hot-toast';
import { Loader2, Plus, Trash2, HelpCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import TextAreaWithLabel from '@/components/inputs-fields/TextareaWithLabel';
import {
  addChecklistTopic,
  updateChecklistTopic
} from '@/actions/admin/ehs/checklist';
import { AppRoutes } from '@/constants/AppRoutes';
import {
  ChecklistTopicAndQuestionsType,
  EhsChecklistFormType,
  EhsChecklistType
} from '@/types/ehs.types';
import { Input } from '@/components/ui/input';
import { EhsChecklistFormSchema } from '@/validations/admin/add-checklist';
import { deleteFile, uploadFile } from '@/utils';
import Image from 'next/image';

const EhsChecklistAddUpdateSection = ({
  initialData
}: {
  initialData?: ChecklistTopicAndQuestionsType;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExistingImageRemoved, setIsExistingImageRemoved] = useState(false);
  const [selectedImagePreview, setSelectedImagePreview] = useState<
    string | null
  >(null);
  const router = useRouter();
  const isEditMode = !!initialData;

  const existingFileName = initialData?.image_url
    ? initialData.image_url.split('/').pop()
    : '';

  const getOriginalFileName = (fileName: string) => {
    return fileName.split('_').slice(1).join('_');
  };

  const originalFileName = getOriginalFileName(existingFileName as string);

  const [deletedQuestionIds, setDeletedQuestionIds] = useState<number[]>([]);

  const {
    register,
    handleSubmit,
    control,
    setError,
    resetField,
    formState: { errors },
    watch
  } = useForm<EhsChecklistType>({
    resolver: zodResolver(EhsChecklistFormSchema),
    defaultValues: {
      topic_name: initialData?.topic_name ?? '',
      header_fields: initialData?.header_fields ?? [],
      questions: initialData?.ehs_checklist_questions.map(checklist => {
        return {
          question_id: checklist.id.toString(),
          question: checklist.question,
          weight: checklist.weightage.toString()
        };
      }) || [{ question: '', weight: '5', question_id: null }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions'
  });

  const questions = watch('questions');
  const imageField = register('image_url');
  const displayedImageUrl =
    selectedImagePreview ||
    (!isExistingImageRemoved ? initialData?.image_url : '');

  useEffect(() => {
    return () => {
      if (selectedImagePreview) {
        URL.revokeObjectURL(selectedImagePreview);
      }
    };
  }, [selectedImagePreview]);

  const totalWeight = questions.reduce(
    (sum, q) => sum + Number(q.weight || 0),
    0
  );

  const handleFormSubmit = async (data: EhsChecklistType) => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        let image = isExistingImageRemoved ? '' : initialData.image_url;

        if (data.image_url) {
          try {
            image = await uploadFile(
              data.image_url,
              'product_images',
              'images'
            );
          } catch (error) {
            setError('image_url', { message: error.message });
            throw error;
          }
        }

        const dataToSubmit: EhsChecklistFormType = {
          topic_name: data.topic_name,
          image_url: image,
          header_fields: data.header_fields ?? [],
          questions: data.questions
        };

        const res = await updateChecklistTopic(
          initialData,
          dataToSubmit,
          deletedQuestionIds
        );
        if (res.success) {
          if (
            initialData.image_url &&
            (isExistingImageRemoved || data.image_url)
          ) {
            try {
              await deleteFile(
                initialData.image_url,
                'product_images',
                'images'
              );
            } catch (error) {
              console.error('Failed to remove the previous image:', error);
            }
          }

          toast.success('Checklist updated successfully');
          router.refresh();
          router.push(AppRoutes.ADMIN_EHS_CHECKLIST_LISTING);
        } else {
          toast.error('Failed to update checklist');
        }
      } else {
        let image = '';

        if (data.image_url) {
          try {
            image = await uploadFile(
              data.image_url,
              'product_images',
              'images'
            );
          } catch (error) {
            setError('image_url', { message: error.message });
            throw error;
          }
        }

        const dataToSubmit: EhsChecklistFormType = {
          topic_name: data.topic_name,
          image_url: image,
          header_fields: data.header_fields ?? [],
          questions: data.questions
        };

        const res = await addChecklistTopic(dataToSubmit);

        if (res.success) {
          toast.success('Checklist created successfully');
          router.push(AppRoutes.ADMIN_EHS_CHECKLIST_LISTING);
        } else {
          toast.error('Failed to create checklist');
        }
      }
    } catch (error) {
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} checklist`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full  mx-auto  ">
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-6 sm:space-y-8"
      >
        <div className="space-y-4 sm:space-y-6">
          {/* Topic Name Input */}
          <div className="w-full">
            <InputFieldWithLabel
              type="text"
              label="Topic Name"
              placeholder="Enter the checklist topic"
              errorText={errors.topic_name?.message}
              required
              {...register('topic_name')}
              className="w-full"
            />
          </div>

          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-semibold">
                Checklist Questions
              </h3>
              <HelpCircle className="h-4 w-4 text-gray-400" />
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 text-green-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium whitespace-nowrap">
                Total Weightage: {totalWeight}
              </span>
            </div>
          </div>

          {/* Questions Section */}
          <div className="space-y-4 sm:space-y-6">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="relative bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm"
              >
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6">
                  <div className="col-span-1 sm:col-span-3">
                    <TextAreaWithLabel
                      label={`Question ${index + 1}`}
                      placeholder="Enter your question here"
                      errorText={errors.questions?.[index]?.question?.message}
                      required
                      rows={3}
                      {...register(`questions.${index}.question`)}
                    />

                    <Input
                      id={field.id}
                      value={field.question_id || undefined}
                      {...register(`questions.${index}.question_id`)}
                      className="hidden"
                    />
                  </div>

                  <div className="col-span-1">
                    <InputFieldWithLabel
                      type="number"
                      label="Weightage"
                      min="1"
                      errorText={errors.questions?.[index]?.weight?.message}
                      required
                      {...register(`questions.${index}.weight`)}
                      className="w-full"
                    />
                  </div>
                </div>

                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 sm:right-4 sm:top-4"
                    onClick={() => {
                      remove(index);
                      if (field.question_id) {
                        setDeletedQuestionIds(prev => [
                          ...prev,
                          parseInt(field.question_id as string)
                        ]);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500 hover:text-red-600" />
                  </Button>
                )}
              </div>
            ))}

            {/* Add Question Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto border-dashed"
              onClick={() =>
                append({ question: '', weight: '5', question_id: null })
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="whitespace-nowrap">Add New Question</span>
            </Button>
          </div>

          <div className="space-y-4">
            {/* Image Upload */}
            <div>
              <label>Upload Image</label>
              <Input
                type="file"
                accept="image/*"
                {...imageField}
                onChange={event => {
                  imageField.onChange(event);
                  const selectedFile = event.target.files?.[0];

                  setSelectedImagePreview(
                    selectedFile ? URL.createObjectURL(selectedFile) : null
                  );
                }}
                className="file:p-[5px] file:mb-1 file:rounded-lg mt-2 file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
              />
              {errors.image_url && (
                <p className="text-sm text-red-500">
                  {errors.image_url.message}
                </p>
              )}

              {existingFileName &&
                !isExistingImageRemoved &&
                !selectedImagePreview && (
                  <p className="text-sm mt-1">
                    Existing File: <strong>{originalFileName}</strong>
                  </p>
                )}

              {displayedImageUrl && (
                <div className="relative mt-3 flex min-h-40 max-h-80 w-full items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-gray-50 p-2">
                  <Image
                    src={displayedImageUrl}
                    alt="Checklist preview"
                    width={1200}
                    height={600}
                    className="h-auto max-h-[19rem] w-auto max-w-full object-contain"
                    unoptimized
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute right-3 top-3"
                    onClick={() => {
                      if (selectedImagePreview) {
                        resetField('image_url');
                        setSelectedImagePreview(null);
                      } else {
                        setIsExistingImageRemoved(true);
                      }
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove Image
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4 pt-4 sm:pt-6 ">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </span>
            ) : isEditMode ? (
              'Update Checklist'
            ) : (
              'Create Checklist'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EhsChecklistAddUpdateSection;
