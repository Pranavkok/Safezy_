import React, { useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import SelectWithLabel from '@/components/inputs-fields/SelectWithLabel';
import NextPreviousButton from './common/NextPreviousButton';
import { zodResolver } from '@hookform/resolvers/zod';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import InputFieldWithLabel from '@/components/inputs-fields/InputFieldWithLabel';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { addPreIncidentOperationDetails } from '@/actions/contractor/incident-analysis';
import toast from 'react-hot-toast';
import { IncidentAnalysisType } from '@/types/index.types';
import {
  AddPreIncidentOperationDetailsType,
  EquipmentsType,
  TeamMemberType
} from '@/types/ehs.types';
import { AddPreIncidentOperationDetailsSchema } from '@/validations/contractor/add-incident-analysis';
import { AppRoutes } from '@/constants/AppRoutes';
import { useRouter } from 'next/navigation';

const frequencyOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' }
];

const PreIncidentProcessStep = ({
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
  } = useForm<AddPreIncidentOperationDetailsType>({
    resolver: zodResolver(AddPreIncidentOperationDetailsSchema),
    defaultValues: {
      is_regular_process: incidentDetails.regular_process || 'No',
      process_details: incidentDetails.process_before_incident || '',
      training_communicated: incidentDetails.instructions_communicated || 'No',
      process_frequency: incidentDetails.process_frequency || '',
      team_members: (incidentDetails.team_involved as TeamMemberType[]) || [
        { name: '', email: '', contact: '' }
      ],
      equipment: (incidentDetails.tools_involved as EquipmentsType[]) || [
        { name: '', is_ehs_checklist_completed: '', condition: '' }
      ]
    }
  });

  const {
    fields: teamFields,
    append: appendTeam,
    remove: removeTeam
  } = useFieldArray({
    control,
    name: 'team_members'
  });

  const {
    fields: equipmentFields,
    append: appendEquipment,
    remove: removeEquipment
  } = useFieldArray({
    control,
    name: 'equipment'
  });
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const isRegularProcess = watch('is_regular_process');

  const onSubmitHandler = async (data: AddPreIncidentOperationDetailsType) => {
    try {
      setIsLoading(true);

      if (isDirty) {
        const res = await addPreIncidentOperationDetails(
          data,
          incidentDetails.id
        );

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
      <div className="space-y-4">
        {/* Process Details */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            What process/operation was ongoing before the incident?{' '}
            <span className="text-red-500">*</span>
          </label>
          <Textarea
            className="w-full h-32"
            {...register('process_details')}
            placeholder="Describe the process or operation in detail..."
          />
          {errors.process_details && (
            <p className="text-sm text-red-500">
              {errors.process_details.message}
            </p>
          )}
        </div>

        {/* Team Members Section */}
        <div className="space-y-2">
          <div className="flex flex-col gap-4 xsm:flex-row  xsm:justify-between xsm:items-center">
            <label className="block text-sm font-medium">
              Team Member/Co-workers (please add name of person in close
              proximity) <span className="text-red-500">*</span>
            </label>
            <Button
              type="button"
              onClick={() => appendTeam({ name: '', email: '', contact: '' })}
              variant="outline"
              size="sm"
            >
              Add Team Member
            </Button>
          </div>

          {teamFields?.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Team Member {index + 1}</h4>
                {teamFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className=""
                    onClick={() => removeTeam(index)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputFieldWithLabel
                  label="Name"
                  {...register(`team_members.${index}.name`)}
                  errorText={errors.team_members?.[index]?.name?.message}
                  required
                />
                <InputFieldWithLabel
                  label="Email"
                  type="email"
                  {...register(`team_members.${index}.email`)}
                  errorText={errors.team_members?.[index]?.email?.message}
                />
                <InputFieldWithLabel
                  label="Contact"
                  type="tel"
                  {...register(`team_members.${index}.contact`)}
                  errorText={errors.team_members?.[index]?.contact?.message}
                  required
                />
              </div>
            </div>
          ))}
          {errors.team_members && (
            <p className="text-sm text-red-500">
              {errors.team_members.message}
            </p>
          )}
        </div>

        {/* Training Communication Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Was training or instructions clearly communicated?{' '}
            <span className="text-red-500">*</span>
          </label>
          <Controller
            name="training_communicated"
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
          {errors.training_communicated && (
            <p className="text-sm text-red-500">
              {errors.training_communicated.message}
            </p>
          )}
        </div>

        {/* Regular Process Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Is this a regular process? <span className="text-red-500">*</span>
            </label>
            <Controller
              name="is_regular_process"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex items-center space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Yes" id="process-yes" />
                    <Label htmlFor="process-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No" id="process-no" />
                    <Label htmlFor="process-no">No</Label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>

          {isRegularProcess === 'Yes' && (
            <Controller
              control={control}
              name="process_frequency"
              render={({ field }) => (
                <SelectWithLabel
                  label="Process Frequency"
                  name="process_frequency"
                  options={frequencyOptions}
                  errorText={errors.process_frequency?.message}
                  onChange={field.onChange}
                  value={field.value}
                  required
                />
              )}
            />
          )}
        </div>

        {/* Equipment Section */}
        <div className="space-y-2">
          <div className="flex flex-col gap-4 xsm:flex-row  xsm:justify-between xsm:items-center">
            <label className="block text-sm font-medium">
              Tools involved in Incident
            </label>
            <Button
              type="button"
              onClick={() =>
                appendEquipment({
                  name: '',
                  is_ehs_checklist_completed: '',
                  condition: ''
                })
              }
              variant="outline"
              size="sm"
            >
              Add Equipment
            </Button>
          </div>

          {equipmentFields?.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Equipment {index + 1}</h4>
                {equipmentFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEquipment(index)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 ">
                <InputFieldWithLabel
                  label="Equipment Name"
                  {...register(`equipment.${index}.name`)}
                  errorText={errors.equipment?.[index]?.name?.message}
                />

                <InputFieldWithLabel
                  label="Condition"
                  errorText={errors.equipment?.[index]?.condition?.message}
                  {...register(`equipment.${index}.condition`)}
                />
              </div>
              <div className="space-y-2">
                <label>
                  EHS Checklist completed?{' '}
                  <span className="text-red-500">*</span>
                </label>
                <Controller
                  name={`equipment.${index}.is_ehs_checklist_completed`}
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex items-center space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id={`ehs-yes-${index}`} />
                        <Label htmlFor={`ehs-yes-${index}`}>Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id={`ehs-no-${index}`} />
                        <Label htmlFor={`ehs-no-${index}`}>No</Label>
                      </div>
                    </RadioGroup>
                  )}
                />
                {errors.equipment?.[index]?.is_ehs_checklist_completed
                  ?.message && (
                  <p className="text-sm text-red-500">
                    {
                      errors.equipment?.[index]?.is_ehs_checklist_completed
                        ?.message
                    }
                  </p>
                )}
              </div>
            </div>
          ))}
          {errors.equipment && (
            <p className="text-sm text-red-500">{errors.equipment.message}</p>
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

export default PreIncidentProcessStep;
