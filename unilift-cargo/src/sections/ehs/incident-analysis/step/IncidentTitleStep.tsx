import InputFieldWithLabel from '@/components/inputs-fields/InputFieldWithLabel';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  addIncidentTitle,
  updateIncidentTitle
} from '@/actions/contractor/incident-analysis';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { IncidentAnalysisType } from '@/types/index.types';
import { useUser } from '@/context/UserContext';
import { AddIncidentTitleType } from '@/types/ehs.types';
import { AddIncidentTitleSchema } from '@/validations/contractor/add-incident-analysis';
import { AppRoutes } from '@/constants/AppRoutes';
import { Button } from '@/components/ui/button';

const IncidentTitleStep = ({
  incidentDetails
}: {
  incidentDetails?: IncidentAnalysisType;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty }
  } = useForm<AddIncidentTitleType>({
    resolver: zodResolver(AddIncidentTitleSchema),
    defaultValues: {
      title: incidentDetails?.title || ''
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const user = useUser();

  const onSubmitHandler = async (data: AddIncidentTitleType) => {
    if (!user?.userId) {
      toast.dismiss();
      toast.error('Please login or signup before adding incident details');
      return;
    }

    try {
      setIsLoading(true);

      if (isDirty) {
        if (incidentDetails) {
          const res = await updateIncidentTitle(data, incidentDetails.id);

          if (res.success) {
            toast.success(res.message);
            router.replace(
              `${AppRoutes.EHS_INCIDENT_ANALYSIS_UPDATE(incidentDetails.id)}?stepId=2`
            );
          } else {
            toast.error(res.message);
          }
        } else {
          const res = await addIncidentTitle({ title: data.title });

          if (res.success && res.data?.id) {
            toast.success(res.message);
            router.replace(
              `${AppRoutes.EHS_INCIDENT_ANALYSIS_UPDATE(res.data?.id)}?stepId=2`
            );
          } else {
            toast.error(res.message);
          }
        }
      } else {
        if (incidentDetails?.id) {
          router.replace(
            `${AppRoutes.EHS_INCIDENT_ANALYSIS_UPDATE(incidentDetails.id)}?stepId=2`
          );
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4  ">
      <InputFieldWithLabel
        label="Incident Title"
        required
        errorText={errors.title?.message}
        {...register('title')}
      />

      <div className="flex justify-end">
        <Button
          disabled={isLoading}
          type="submit"
          className="px-6 capitalize text-sm sm:ml-auto"
        >
          {isLoading && 'Submitting...'}
          {!isLoading && 'Save & Next'}
        </Button>
      </div>
    </form>
  );
};

export default IncidentTitleStep;
