import React, { useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import InputFieldWithLabel from '@/components/inputs-fields/InputFieldWithLabel';
import NextPreviousButton from './common/NextPreviousButton';
import { zodResolver } from '@hookform/resolvers/zod';
import { Textarea } from '@/components/ui/textarea';
import { addAffectedPersonDetails } from '@/actions/contractor/incident-analysis';
import toast from 'react-hot-toast';
import { IncidentAnalysisType } from '@/types/index.types';
import {
  AddAffectedPersonDetailsType,
  EntityDetailsType
} from '@/types/ehs.types';
import { AddAffectedPersonDetailsSchema } from '@/validations/contractor/add-incident-analysis';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { AppRoutes } from '@/constants/AppRoutes';
import { useRouter } from 'next/navigation';
import SelectWithLabel from '@/components/inputs-fields/SelectWithLabel';

const AffectedEntityStep = ({
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
    formState: { errors, isDirty }
  } = useForm<AddAffectedPersonDetailsType>({
    resolver: zodResolver(AddAffectedPersonDetailsSchema),
    defaultValues: {
      cause_details: incidentDetails.cause_to_entity ?? '',
      entity_details:
        (incidentDetails.entity_details as EntityDetailsType[]) || [
          { name: '', designation: '', department: '' }
        ],
      shift_start: incidentDetails.entity_shift_date ?? '',
      shift_details: incidentDetails.entity_shift_details ?? ''
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'entity_details'
  });

  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const onSubmitHandler = async (data: AddAffectedPersonDetailsType) => {
    try {
      setIsLoading(true);

      if (isDirty) {
        const res = await addAffectedPersonDetails(data, incidentDetails.id);

        if (res.success) {
          toast.success(res.message);
          router.replace(
            `${AppRoutes.EHS_INCIDENT_ANALYSIS_UPDATE(incidentDetails.id)}?stepId=${currentStep + 1}`
          );
        } else {
          toast.error(res.message);
        }
      } else {
        router.replace(
          `${AppRoutes.EHS_INCIDENT_ANALYSIS_UPDATE(incidentDetails.id)}?stepId=${currentStep + 1}`
        );
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium">Affected Entity Details</h3>
          </div>
          {fields?.map((field, index) => (
            <div key={field.id} className="border rounded-lg p-4 mb-4 relative">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputFieldWithLabel
                  label="Name"
                  required
                  errorText={errors?.entity_details?.[index]?.name?.message}
                  {...register(`entity_details.${index}.name`)}
                />
                <InputFieldWithLabel
                  label="Designation"
                  errorText={
                    errors?.entity_details?.[index]?.designation?.message
                  }
                  {...register(`entity_details.${index}.designation`)}
                />
                <div className="">
                  <InputFieldWithLabel
                    label="Department"
                    required
                    errorText={
                      errors?.entity_details?.[index]?.department?.message
                    }
                    {...register(`entity_details.${index}.department`)}
                  />
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({ name: '', designation: '', department: '' })
            }
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Entity
          </Button>
        </div>

        <div className="space-y-2 py-4">
          <label className="font-medium">
            Cause to Entity (Details or Report){' '}
            <span className="text-red-500">*</span>
          </label>
          <Textarea
            className="w-full h-32 p-2 border rounded-md"
            {...register('cause_details')}
            placeholder="Describe what happens to the affected entity."
          />
          {errors.cause_details && (
            <p className="text-sm text-red-500">
              {errors.cause_details.message}
            </p>
          )}
        </div>

        <div className="py-4">
          <h3 className="font-medium mb-2">Shift Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputFieldWithLabel
              label="Date of Incident"
              type="date"
              required
              errorText={errors.shift_start?.message}
              {...register('shift_start')}
            />
            <Controller
              control={control}
              name="shift_details"
              render={({ field }) => (
                <SelectWithLabel
                  label="Shift"
                  name="shift_details"
                  options={[
                    { label: 'A Shift', value: 'A' },
                    { label: 'B Shift', value: 'B' },
                    { label: 'C Shift', value: 'C' },
                    { label: 'G Shift', value: 'G' },
                    { label: 'D Shift', value: 'D' },
                    { label: 'N Shift', value: 'N' }
                  ]}
                  errorText={errors.shift_details?.message}
                  onChange={field.onChange}
                  value={field.value}
                  required
                />
              )}
            />
          </div>
        </div>
      </div>

      <NextPreviousButton
        incidentId={incidentDetails.id}
        currentStep={currentStep}
        isSubmitting={isLoading}
      />
    </form>
  );
};

export default AffectedEntityStep;
