import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import InputFieldWithLabel from '@/components/inputs-fields/InputFieldWithLabel';
import NextPreviousButton from './common/NextPreviousButton';
import { zodResolver } from '@hookform/resolvers/zod';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { addIncidentWitnessDetails } from '@/actions/contractor/incident-analysis';
import toast from 'react-hot-toast';
import { IncidentAnalysisType } from '@/types/index.types';
import { uploadMultipleFiles } from '@/utils';
import { Input } from '@/components/ui/input';
import { AddWitnessDetailsType } from '@/types/ehs.types';
import { AddWitnessDetailsSchema } from '@/validations/contractor/add-incident-analysis';
import { AppRoutes } from '@/constants/AppRoutes';
import { useRouter } from 'next/navigation';

const WitnessDetailsStep = ({
  currentStep,
  incidentDetails
}: {
  currentStep: number;
  incidentDetails: IncidentAnalysisType;
}) => {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    clearErrors
  } = useForm<AddWitnessDetailsType>({
    resolver: zodResolver(AddWitnessDetailsSchema),
    defaultValues: {
      has_recordings: incidentDetails.witness_records || 'No',
      witness_name: incidentDetails.witness_name || '',
      witness_designation: incidentDetails.witness_designation || ''
    }
  });
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [fileError, setFileError] = useState('');
  const hasRecordings = watch('has_recordings');

  const onSubmitHandler = async (data: AddWitnessDetailsType) => {
    try {
      if (hasRecordings === 'Yes' && data.images && data.images.length > 0) {
        if (fileError) {
          return;
        }
      }

      setIsLoading(true);
      let uploadImages: {
        publicUrl: string;
      }[] = [];

      if (data.images && data.images.length > 0) {
        uploadImages = await uploadMultipleFiles(
          data.images as File[],
          'ehs',
          'img'
        );
      }

      const res = await addIncidentWitnessDetails(
        {
          has_recordings: data.has_recordings,
          witness_designation: data.witness_designation,
          witness_name: data.witness_name
        },
        incidentDetails.id,
        uploadImages
      );

      if (res.success) {
        toast.success(res.message);
        router.replace(
          `${AppRoutes.EHS_INCIDENT_ANALYSIS_UPDATE(incidentDetails.id)}?stepId=${currentStep + 1}`
        );
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    setFileError('');

    if (files && files.length > 0) {
      const currentImages = watch('images') || [];
      const newImages = Array.from(files);

      const combinedImages = [...currentImages, ...newImages];
      setValue('images', combinedImages as File[]);
      clearErrors('images');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)}>
      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4 ">
        <div className="md:col-span-1">
          <InputFieldWithLabel
            className="w-full"
            label="Witness Name"
            required
            errorText={errors.witness_name?.message}
            {...register('witness_name', {
              required: 'Witness name is required'
            })}
          />
        </div>
        <div className="md:col-span-1">
          <InputFieldWithLabel
            className="w-full"
            label="Witness Designation"
            required
            errorText={errors.witness_designation?.message}
            {...register('witness_designation', {
              required: 'Witness designation is required'
            })}
          />
        </div>

        <div className="col-span-1 md:col-span-2 space-y-3">
          <label className="block text-sm font-medium">
            Recordings or Photos Available?{' '}
            <span className="text-red-500">*</span>
          </label>
          <Controller
            name="has_recordings"
            control={control}
            rules={{ required: 'Please select an option' }}
            render={({ field }) => (
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex items-center space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Yes" id="yes" />
                  <Label htmlFor="yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="no" />
                  <Label htmlFor="no">No</Label>
                </div>
              </RadioGroup>
            )}
          />
          {errors.has_recordings && (
            <p className="text-sm text-red-500">
              {errors.has_recordings.message}
            </p>
          )}
        </div>
        {hasRecordings === 'Yes' && (
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Upload Images</label>

              <Input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                multiple
                onChange={handleFileSelect}
              />
              {errors.images && (
                <p className="text-sm text-red-500">
                  {errors.images[0]?.message as string}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        <NextPreviousButton
          incidentId={incidentDetails.id}
          currentStep={currentStep}
          isSubmitting={isLoading}
        />
      </div>
    </form>
  );
};

export default WitnessDetailsStep;
