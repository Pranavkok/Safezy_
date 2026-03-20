import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import NextPreviousButton from './common/NextPreviousButton';
import { zodResolver } from '@hookform/resolvers/zod';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { IncidentAnalysisType } from '@/types/index.types';
import toast from 'react-hot-toast';
import { addHistoricalData } from '@/actions/contractor/incident-analysis';
import { AddHistoricalDataType } from '@/types/ehs.types';
import { AddHistoricalDataSchema } from '@/validations/contractor/add-incident-analysis';
import { AppRoutes } from '@/constants/AppRoutes';
import { useRouter } from 'next/navigation';

const HistoricalRecordsStep = ({
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
  } = useForm<AddHistoricalDataType>({
    resolver: zodResolver(AddHistoricalDataSchema),
    defaultValues: {
      has_past_incidents: incidentDetails.is_a_past_incident || 'No',
      past_incidents_remarks: incidentDetails.past_incident_remarks || '',
      has_training_records: incidentDetails.training_provided || 'No',
      training_records_remarks: incidentDetails.training_remarks || ''
    }
  });

  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const hasPastIncidents = watch('has_past_incidents');
  const hasTrainingRecords = watch('has_training_records');

  const onSubmitHandler = async (data: AddHistoricalDataType) => {
    try {
      setIsLoading(true);

      if (isDirty) {
        const res = await addHistoricalData(data, incidentDetails.id);

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
      <div className="space-y-8">
        {/* Past Incidents Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Past Incidents in the Area <span className="text-red-500">*</span>
            </label>
            <Controller
              name="has_past_incidents"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex items-center space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Yes" id="incidents-yes" />
                    <Label htmlFor="incidents-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No" id="incidents-no" />
                    <Label htmlFor="incidents-no">No</Label>
                  </div>
                </RadioGroup>
              )}
            />
            {errors.has_past_incidents && (
              <p className="text-sm text-red-500">
                {errors.has_past_incidents.message}
              </p>
            )}
          </div>

          {hasPastIncidents === 'Yes' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Past Incidents Remarks
              </label>
              <Textarea
                className="w-full"
                {...register('past_incidents_remarks')}
                placeholder="Provide frequency and details of past incidents..."
              />
              {errors.past_incidents_remarks && (
                <p className="text-sm text-red-500">
                  {errors.past_incidents_remarks.message}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Training Records Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Training Records for team/process involved{' '}
              <span className="text-red-500">*</span>
            </label>
            <Controller
              name="has_training_records"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex items-center space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Yes" id="training-yes" />
                    <Label htmlFor="training-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No" id="training-no" />
                    <Label htmlFor="training-no">No</Label>
                  </div>
                </RadioGroup>
              )}
            />
            {errors.has_training_records && (
              <p className="text-sm text-red-500">
                {errors.has_training_records.message}
              </p>
            )}
          </div>

          {hasTrainingRecords === 'Yes' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Training Records Remarks
              </label>
              <Textarea
                className="w-full"
                {...register('training_records_remarks')}
                placeholder="Provide details about training records and dates..."
              />
              {errors.training_records_remarks && (
                <p className="text-sm text-red-500">
                  {errors.training_records_remarks.message}
                </p>
              )}
            </div>
          )}
        </div>
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

export default HistoricalRecordsStep;
