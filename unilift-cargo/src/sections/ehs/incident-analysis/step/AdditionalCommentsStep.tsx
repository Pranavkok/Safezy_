'use client';

import React, { useState } from 'react';
import { addAdditionalComments } from '@/actions/contractor/incident-analysis';
import TextAreaWithLabel from '@/components/inputs-fields/TextareaWithLabel';
import { Button } from '@/components/ui/button';
import { AppRoutes } from '@/constants/AppRoutes';
import { AddAdditionalCommentsType } from '@/types/ehs.types';
import { IncidentAnalysisType } from '@/types/index.types';
import { AddAdditionalCommentsSchema } from '@/validations/contractor/add-incident-analysis';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

const AdditionalCommentsStep = ({
  incidentDetails
}: {
  incidentDetails: IncidentAnalysisType;
}) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<AddAdditionalCommentsType>({
    resolver: zodResolver(AddAdditionalCommentsSchema),
    defaultValues: {
      additionalComments: incidentDetails.additional_comments || ''
    }
  });

  const onSubmitHandler = async (data: AddAdditionalCommentsType) => {
    try {
      setIsSubmitting(true);
      await addAdditionalComments(data, incidentDetails.id);
      router.replace(
        AppRoutes.EHS_INCIDENT_ANALYSIS_REPORT(incidentDetails.id)
      );
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">
            Add Additional Comments
          </h1>
        </div>
        <div className="mt-6 p-4 border rounded-lg">
          <TextAreaWithLabel
            label="Additional Comments"
            {...register('additionalComments')}
            placeholder="Enter any additional comments or observations about the investigation..."
            rows={4}
            errorText={errors.additionalComments?.message}
          />
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-6 capitalize text-sm sm:ml-auto"
          >
            {isSubmitting ? 'Submitting...' : 'Submit and Generate Report'}
          </Button>
        </div>
      </form>
    </>
  );
};

export default AdditionalCommentsStep;
