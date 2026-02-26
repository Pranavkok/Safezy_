import React, { useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import InputFieldWithLabel from '@/components/inputs-fields/InputFieldWithLabel';
import NextPreviousButton from './common/NextPreviousButton';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { MultiSelect } from '@/components/inputs-fields/MultiSelect';
import { addIncidentBasicDetails } from '@/actions/contractor/incident-analysis';
import { IncidentAnalysisType } from '@/types/index.types';
import toast from 'react-hot-toast';
import { AddIncidentBasicDetails } from '@/validations/contractor/add-incident-analysis';
import {
  AddIncidentBasicDetailsType,
  TeamMemberBasicType
} from '@/types/ehs.types';
import { useRouter } from 'next/navigation';
import { AppRoutes } from '@/constants/AppRoutes';

const entityTypeOptions = [
  { value: 'person', label: 'Person' },
  { value: 'place', label: 'Place' },
  { value: 'machine', label: 'Machine' },
  { value: 'other', label: 'Other' }
];

const BasicIncidentInfoStep = ({
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
    formState: { errors, isDirty }
  } = useForm<AddIncidentBasicDetailsType>({
    defaultValues: {
      affected_entity: incidentDetails.affected_entity as string[],
      custom_affected_entity: incidentDetails.custom_affected_entity ?? '',
      incident_datetime: incidentDetails.date ?? '',
      location: incidentDetails.location ?? '',
      narrative: incidentDetails.narrative ?? '',
      investigation_team:
        (incidentDetails.investigation_team as TeamMemberBasicType[]) || [
          { name: '', email: '', contact: '' }
        ]
    },
    resolver: zodResolver(AddIncidentBasicDetails)
  });

  const router = useRouter();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'investigation_team'
  });

  const [isLoading, setIsLoading] = useState(false);
  const selectedEntity = watch('affected_entity');

  const onSubmitHandler = async (data: AddIncidentBasicDetailsType) => {
    try {
      setIsLoading(true);

      if (isDirty) {
        const res = await addIncidentBasicDetails(data, incidentDetails.id);
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
    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <div className=" mb-2">
            <h3 className="text-lg font-medium">Investigation Team</h3>
          </div>
          {fields?.map((field, index) => (
            <div key={field.id} className="border rounded-lg p-4 mb-4 relative">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputFieldWithLabel
                  label="Name"
                  required
                  errorText={errors?.investigation_team?.[index]?.name?.message}
                  {...register(`investigation_team.${index}.name`)}
                />
                <InputFieldWithLabel
                  label="Email"
                  type="email"
                  required
                  errorText={
                    errors?.investigation_team?.[index]?.email?.message
                  }
                  {...register(`investigation_team.${index}.email`)}
                />
                <div className="">
                  <InputFieldWithLabel
                    label="Contact No"
                    required
                    errorText={
                      errors?.investigation_team?.[index]?.contact?.message
                    }
                    {...register(`investigation_team.${index}.contact`)}
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
            onClick={() => append({ name: '', email: '', contact: '' })}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Team Member
          </Button>
        </div>

        <div>
          <label htmlFor="narrative" className="block font-medium mb-2">
            Narrative of Incident <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="narrative"
            className="w-full h-36"
            {...register('narrative')}
          />
          {errors.narrative && (
            <p className="text-sm text-red-500">{errors.narrative.message}</p>
          )}
        </div>
        <div>
          <InputFieldWithLabel
            label="Date and Time of Incident"
            type="datetime-local"
            required
            errorText={errors.incident_datetime?.message}
            {...register('incident_datetime')}
          />

          <InputFieldWithLabel
            label="Location"
            errorText={errors.location?.message}
            {...register('location')}
            required
          />
        </div>

        <div className="space-y-2 ">
          <label htmlFor="affected_entity" className="capitalize">
            Affected Entity<span className="ml-[2px] text-red-500">*</span>
          </label>
          <Controller
            name="affected_entity"
            control={control}
            render={({ field }) => (
              <MultiSelect
                className="w-full"
                defaultValue={
                  incidentDetails.affected_entity
                    ? (incidentDetails.affected_entity as string[])
                    : []
                }
                options={entityTypeOptions}
                onValueChange={field.onChange}
                value={field.value}
                variant={'inverted'}
              />
            )}
          />

          {errors.affected_entity?.message && (
            <div className="text-sm text-red-500">
              {errors.affected_entity?.message}
            </div>
          )}
        </div>

        <div>
          {selectedEntity?.includes('other') && (
            <InputFieldWithLabel
              placeholder="Please specify the affected entity"
              label="Other Entity Details"
              errorText={errors.custom_affected_entity?.message}
              {...register('custom_affected_entity')}
              required
            />
          )}
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

export default BasicIncidentInfoStep;
