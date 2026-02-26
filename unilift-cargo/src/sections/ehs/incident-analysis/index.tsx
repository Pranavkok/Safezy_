'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

import {
  FileText,
  User,
  AlertCircle,
  Clock,
  CheckCircle2,
  ClipboardList,
  History
} from 'lucide-react';
import IncidentTitleStep from './step/IncidentTitleStep';
import BasicIncidentInfoStep from './step/BasicIncidentInfoStep';
import AffectedEntityStep from './step/AffectedEntityStep';
import WitnessDetailsStep from './step/WitnessDetailsStep';
import PreIncidentProcessStep from './step/PreIncidentProcessStep';
import HistoricalRecordsStep from './step/HistoricalRecordsStep';
import InvestigationChecklistStep from './step/InvestigationChecklist';
import { IncidentAnalysisType } from '@/types/index.types';
import CorrectivePreventiveActionStep from './step/CorrectivePreventiveActionStep';
import { useSearchParams } from 'next/navigation';
import EHSIncidentAnalysisModal from '@/components/modals/ehs/EHSIncidentAnalysisModal';
import AdditionalCommentsStep from './step/AdditionalCommentsStep';

export const INCIDENT_ANALYSIS_STEPS = [
  {
    stepId: 1,
    name: 'Incident Title',
    icon: FileText,
    description: 'Initial incident title'
  },
  {
    stepId: 2,
    name: 'Basic Information',
    icon: FileText,
    description: 'Basic incident details'
  },
  {
    stepId: 3,
    name: 'Affected Entity Details',
    icon: User,
    description: 'Affected individual information'
  },
  {
    stepId: 4,
    name: 'Witness Information',
    icon: AlertCircle,
    description: 'Witness and evidence details'
  },
  {
    stepId: 5,
    name: 'Pre-Incident Details',
    icon: ClipboardList,
    description: 'Process and operation details'
  },
  {
    stepId: 6,
    name: 'Historical Data',
    icon: History,
    description: 'Past incidents and training records'
  },
  {
    stepId: 7,
    name: 'Investigation Checklist',
    icon: History,
    description: 'Evidence Gathering'
  },
  {
    stepId: 8,
    name: 'Corrective & Preventive Actions',
    icon: History,
    description: 'Corrective & Preventive Actions'
  },
  {
    stepId: 9,
    name: 'Additional Comments',
    icon: History,
    description: 'Additional Comments'
  }
];

const getStepColor = (
  stepId: number,
  currentStep: number,
  isFromAdd: boolean
) => {
  if (isFromAdd) {
    return stepId === 1
      ? 'text-blue-700 bg-blue-100 border-blue-300'
      : 'text-gray-400 bg-gray-100 border-gray-300 opacity-50';
  }

  if (stepId < currentStep)
    return 'text-green-700 border-green-300 bg-green-50';
  if (stepId === currentStep)
    return 'text-blue-700 bg-blue-100 border-blue-300';
  return 'text-gray-900 bg-gray-100 border-gray-300';
};

const getStepStatus = (stepId: number, currentStep: number) => {
  if (stepId < currentStep) return 'completed';
  if (stepId === currentStep) return 'current';
  return 'upcoming';
};

const renderStepIcon = (stepId: number, status: string) => {
  if (status === 'completed') {
    return <CheckCircle2 className="w-5 h-5 text-white" />;
  }
  if (status === 'current') {
    return (
      <span className="text-primary font-bold text-xs sm:text-sm">
        {stepId}
      </span>
    );
  }
  return <span className="text-gray-500 text-xs sm:text-sm">{stepId}</span>;
};

const renderFormFields = (
  currentStep: number,
  incidentDetails?: IncidentAnalysisType
) => {
  switch (currentStep) {
    case 1:
      return <IncidentTitleStep incidentDetails={incidentDetails} />;

    case 2:
      return (
        <BasicIncidentInfoStep
          currentStep={currentStep}
          incidentDetails={incidentDetails!}
        />
      );

    case 3:
      return (
        <AffectedEntityStep
          currentStep={currentStep}
          incidentDetails={incidentDetails!}
        />
      );
    case 4:
      return (
        <WitnessDetailsStep
          currentStep={currentStep}
          incidentDetails={incidentDetails!}
        />
      );
    case 5:
      return (
        <PreIncidentProcessStep
          currentStep={currentStep}
          incidentDetails={incidentDetails!}
        />
      );
    case 6:
      return (
        <HistoricalRecordsStep
          currentStep={currentStep}
          incidentDetails={incidentDetails!}
        />
      );
    case 7:
      return (
        <InvestigationChecklistStep
          currentStep={currentStep}
          incidentDetails={incidentDetails!}
        />
      );
    case 8:
      return (
        <CorrectivePreventiveActionStep
          currentStep={currentStep}
          incidentDetails={incidentDetails!}
        />
      );
    case 9:
      return <AdditionalCommentsStep incidentDetails={incidentDetails!} />;

    default:
      return null;
  }
};

const IncidentReportStepper = ({
  isFromAdd = false,
  incidentDetails
}: {
  isFromAdd?: boolean;
  incidentDetails?: IncidentAnalysisType;
}) => {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);

  const activeStep = INCIDENT_ANALYSIS_STEPS.find(
    step => step.stepId === currentStep
  );

  useEffect(() => {
    if (searchParams.get('stepId')) {
      setCurrentStep(parseInt(searchParams.get('stepId')!));
    }
  }, [searchParams.get('stepId')]);

  return (
    <div className="w-[90vw] m-auto my-5">
      <div className="mb-5">
        <EHSIncidentAnalysisModal />
      </div>
      <div className="mb-8">
        <ol className="flex items-center w-full">
          {INCIDENT_ANALYSIS_STEPS?.map((step, index) => {
            const status = getStepStatus(step.stepId, currentStep);
            return (
              <li
                key={step.stepId}
                className={`flex items-center ${
                  index < INCIDENT_ANALYSIS_STEPS.length - 1 ? 'w-full' : ''
                }`}
              >
                <span
                  className={`flex items-center justify-center w-5 h-5 sm:w-8 sm:h-8 rounded-full lg:h-12 lg:w-12 shrink-0 
                          ${
                            isFromAdd && step.stepId !== 1
                              ? 'bg-white opacity-50'
                              : status === 'completed'
                                ? 'bg-primary'
                                : status === 'current'
                                  ? 'bg-primary/5 border-2 border-primary bg-white'
                                  : 'bg-white'
                          }`}
                >
                  {renderStepIcon(step.stepId, status)}
                </span>

                {index < INCIDENT_ANALYSIS_STEPS.length - 1 && (
                  <div
                    className={`w-full h-1 ${
                      isFromAdd
                        ? 'bg-gray-200 opacity-70'
                        : status === 'completed'
                          ? 'bg-primary'
                          : 'bg-gray-200'
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="block sm:hidden w-full">
          <div
            className="bg-white w-full p-3 border rounded-lg flex items-center space-x-3 
            transition-all duration-200 shadow-md border-blue-300 text-blue-700"
          >
            {activeStep?.icon && (
              <activeStep.icon className="w-4 h-4 text-blue-700" />
            )}
            <h3 className="text-sm font-medium flex-1">{activeStep?.name}</h3>
            <Clock className="w-4 h-4 flex-shrink-0 animate-pulse" />
          </div>
        </div>

        <div className="lg:w-1/4 hidden sm:block">
          <ol className="flex flex-col space-y-2">
            {INCIDENT_ANALYSIS_STEPS?.map(step => {
              const isStepEnabled =
                (!isFromAdd || step.stepId === 1) &&
                (!incidentDetails?.is_completed ||
                  step.stepId === INCIDENT_ANALYSIS_STEPS.length);

              return (
                <li key={step.stepId}>
                  <div
                    className={`bg-white w-full p-3 border rounded-lg 
                            ${getStepColor(step.stepId, currentStep, isFromAdd)}
                            transition-all duration-200 hover:shadow-md 
                            ${isStepEnabled ? '' : 'cursor-not-allowed opacity-50'}`}
                  >
                    <div className="flex items-center space-x-3">
                      <step.icon
                        className={`w-4 h-4 ${!isStepEnabled ? 'text-gray-400' : ''}`}
                      />
                      <div className="flex-1">
                        <h3
                          className={`text-sm font-medium ${!isStepEnabled ? 'text-gray-400' : ''}`}
                        >
                          {step.name}
                        </h3>
                      </div>
                      {isFromAdd && step.stepId !== 1 ? null : (
                        <>
                          {step.stepId < currentStep && (
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                          )}
                          {step.stepId === currentStep && (
                            <Clock className="w-4 h-4 flex-shrink-0 animate-pulse" />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="lg:w-3/4">
          <Card>
            <CardContent className="pt-6 p-4 sm:p-6">
              {renderFormFields(currentStep, incidentDetails)}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IncidentReportStepper;
