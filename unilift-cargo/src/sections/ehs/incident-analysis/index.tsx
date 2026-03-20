'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Clock, FileText, ShieldAlert } from 'lucide-react';
import IncidentPage1Step from './step/IncidentPage1Step';
import IncidentPage2Step from './step/IncidentPage2Step';
import { IncidentAnalysisType } from '@/types/index.types';
import { useSearchParams } from 'next/navigation';
import EHSIncidentAnalysisModal from '@/components/modals/ehs/EHSIncidentAnalysisModal';

export const INCIDENT_ANALYSIS_STEPS = [
  {
    stepId: 1,
    name: 'Incident Details',
    icon: FileText,
    description: 'Snapshot & Narration'
  },
  {
    stepId: 2,
    name: 'System Analysis',
    icon: ShieldAlert,
    description: 'Root Cause & Impact'
  }
];

const getStepStatus = (stepId: number, currentStep: number) => {
  if (stepId < currentStep) return 'completed';
  if (stepId === currentStep) return 'current';
  return 'upcoming';
};

const renderStepIcon = (stepId: number, status: string) => {
  if (status === 'completed') return <CheckCircle2 className="w-5 h-5 text-white" />;
  if (status === 'current') return <span className="text-primary font-bold text-sm">{stepId}</span>;
  return <span className="text-gray-500 text-sm">{stepId}</span>;
};

const getStepColor = (stepId: number, currentStep: number) => {
  if (stepId < currentStep) return 'text-green-700 border-green-300 bg-green-50';
  if (stepId === currentStep) return 'text-blue-700 bg-blue-100 border-blue-300';
  return 'text-gray-900 bg-gray-100 border-gray-300';
};

const renderFormFields = (
  currentStep: number,
  incidentDetails?: IncidentAnalysisType
) => {
  switch (currentStep) {
    case 1:
      return <IncidentPage1Step incidentDetails={incidentDetails} />;
    case 2:
      return incidentDetails
        ? <IncidentPage2Step incidentDetails={incidentDetails} />
        : null;
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

  const activeStep = INCIDENT_ANALYSIS_STEPS.find(s => s.stepId === currentStep);

  useEffect(() => {
    const stepId = searchParams.get('stepId');
    if (stepId) setCurrentStep(parseInt(stepId));
  }, [searchParams.get('stepId')]);

  return (
    <div className="w-[90vw] m-auto my-5">
      <div className="mb-5">
        <EHSIncidentAnalysisModal />
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <ol className="flex items-center w-full">
          {INCIDENT_ANALYSIS_STEPS.map((step, index) => {
            const status = getStepStatus(step.stepId, currentStep);
            return (
              <li
                key={step.stepId}
                className={`flex items-center ${index < INCIDENT_ANALYSIS_STEPS.length - 1 ? 'w-full' : ''}`}
              >
                <span
                  className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full shrink-0 ${
                    status === 'completed'
                      ? 'bg-primary'
                      : status === 'current'
                        ? 'bg-white border-2 border-primary'
                        : 'bg-white border border-gray-300'
                  }`}
                >
                  {renderStepIcon(step.stepId, status)}
                </span>
                {index < INCIDENT_ANALYSIS_STEPS.length - 1 && (
                  <div
                    className={`w-full h-1 ${status === 'completed' ? 'bg-primary' : 'bg-gray-200'}`}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Mobile: active step pill */}
        <div className="block sm:hidden w-full">
          <div className="bg-white w-full p-3 border rounded-lg flex items-center space-x-3 shadow-md border-blue-300 text-blue-700">
            {activeStep?.icon && <activeStep.icon className="w-4 h-4 text-blue-700" />}
            <div className="flex-1">
              <h3 className="text-sm font-medium">{activeStep?.name}</h3>
              <p className="text-xs text-gray-500">{activeStep?.description}</p>
            </div>
            <Clock className="w-4 h-4 flex-shrink-0 animate-pulse" />
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className="lg:w-1/4 hidden sm:block">
          <ol className="flex flex-col space-y-2">
            {INCIDENT_ANALYSIS_STEPS.map(step => {
              const isEnabled = !isFromAdd || step.stepId === 1;
              return (
                <li key={step.stepId}>
                  <div
                    className={`bg-white w-full p-3 border rounded-lg ${getStepColor(step.stepId, currentStep)} transition-all duration-200 hover:shadow-md ${!isEnabled ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    <div className="flex items-center space-x-3">
                      <step.icon className={`w-4 h-4 ${!isEnabled ? 'text-gray-400' : ''}`} />
                      <div className="flex-1">
                        <h3 className={`text-sm font-medium ${!isEnabled ? 'text-gray-400' : ''}`}>
                          {step.name}
                        </h3>
                        <p className={`text-xs ${!isEnabled ? 'text-gray-300' : 'text-gray-500'}`}>
                          {step.description}
                        </p>
                      </div>
                      {step.stepId < currentStep && <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
                      {step.stepId === currentStep && <Clock className="w-4 h-4 flex-shrink-0 animate-pulse" />}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Form area */}
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
