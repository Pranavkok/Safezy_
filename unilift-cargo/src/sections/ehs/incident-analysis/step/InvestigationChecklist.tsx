import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import InputFieldWithLabel from '@/components/inputs-fields/InputFieldWithLabel';
import NextPreviousButton from './common/NextPreviousButton';
import { zodResolver } from '@hookform/resolvers/zod';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { IncidentAnalysisType } from '@/types/index.types';
import { addInvestigationChecklist } from '@/actions/contractor/incident-analysis';
import { AddInvestigationChecklistSchema } from '@/validations/contractor/add-incident-analysis';
import {
  AddInvestigationChecklistType,
  EmployeeInterviewsType
} from '@/types/ehs.types';
import toast from 'react-hot-toast';
import { AppRoutes } from '@/constants/AppRoutes';
import { useRouter } from 'next/navigation';

const InvestigationChecklistStep = ({
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

    formState: { errors }
  } = useForm<AddInvestigationChecklistType>({
    resolver: zodResolver(AddInvestigationChecklistSchema),
    defaultValues: {
      interviews:
        (incidentDetails.evidence_employee_list as EmployeeInterviewsType[]) || [
          { name: '', designation: '', relation: '', comments: '' }
        ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'interviews'
  });
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const onSubmitHandler = async (data: AddInvestigationChecklistType) => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/generate-capa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(incidentDetails)
      });

      const result = await response.json();

      if (result.success) {
        const res = await addInvestigationChecklist(
          data,
          incidentDetails.id,
          result.data.corrective.points,
          result.data.preventive.points,
          result.data.severity_level,
          result.data.five_whys_analysis,
          result.data.flowchart.points
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
        toast.error(result.message);
        await addInvestigationChecklist(data, incidentDetails.id);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xsm:flex-row  xsm:justify-between xsm:items-center">
          <h2 className="text-lg font-semibold">
            Evidence Gathering - Employee Interviews
          </h2>
          <Button
            type="button"
            onClick={() =>
              append({ name: '', designation: '', relation: '', comments: '' })
            }
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Interview
          </Button>
        </div>

        {fields?.map((field, index) => (
          <div key={field.id} className="p-4 border rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Interview #{index + 1}</h3>
              {fields.length > 1 && (
                <Button
                  onClick={() => remove(index)}
                  type="button"
                  variant="ghost"
                  size="icon"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputFieldWithLabel
                label="Name"
                required
                errorText={errors.interviews?.[index]?.name?.message}
                {...register(`interviews.${index}.name`)}
              />

              <InputFieldWithLabel
                label="Designation"
                required
                errorText={errors.interviews?.[index]?.designation?.message}
                {...register(`interviews.${index}.designation`)}
              />

              <InputFieldWithLabel
                label="Relation with Affected Entity"
                required
                errorText={errors.interviews?.[index]?.relation?.message}
                {...register(`interviews.${index}.relation`)}
              />

              <div className="md:col-span-2">
                <label
                  htmlFor="comments"
                  className="block text-sm font-medium mb-1"
                >
                  Comments <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="comments"
                  className="w-full"
                  {...register(`interviews.${index}.comments`)}
                  placeholder="Enter interview comments and findings..."
                />
                {errors.interviews?.[index]?.comments && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.interviews?.[index]?.comments?.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}

        {errors.interviews && !Array.isArray(errors.interviews) && (
          <p className="text-sm text-red-500">{errors.interviews.message}</p>
        )}
      </div>

      <div className="mt-6">
        <NextPreviousButton
          incidentId={incidentDetails.id}
          currentStep={currentStep}
          isSubmitting={isLoading}
          nextButtonText="Submit & Generate CAPA Points"
        />
      </div>
    </form>
  );
};

export default InvestigationChecklistStep;
