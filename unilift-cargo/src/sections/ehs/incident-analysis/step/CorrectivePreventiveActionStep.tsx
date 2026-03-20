import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, ClipboardCheck, ShieldAlert, AlertTriangle } from 'lucide-react';
import { IncidentAnalysisType } from '@/types/index.types';
import IncidentFlowchart from './common/Flowchart';
import {
  ContributingFactorsType,
  FiveWhysAnalysisJsonType,
  FlowchartJsonType,
  RootCausesJsonType
} from '@/types/ehs.types';
import { Button } from '@/components/ui/button';
import { AppRoutes } from '@/constants/AppRoutes';
import { useRouter } from 'next/navigation';

const CorrectivePreventiveActionStep = ({
  currentStep,
  incidentDetails
}: {
  currentStep: number;
  incidentDetails: IncidentAnalysisType;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fiveWhysAnalysis =
    incidentDetails.viva_analysis as FiveWhysAnalysisJsonType;
  const flowchartPoints =
    incidentDetails.flowchart_points as FlowchartJsonType[];
  const contributingFactors =
    incidentDetails.contributing_factors as ContributingFactorsType;
  const rootCauses = incidentDetails.root_causes as RootCausesJsonType;
  const systemGaps = incidentDetails.system_gaps as string[];

  const router = useRouter();

  const handlePrevious = () => {
    if (currentStep > 1) {
      router.replace(
        `${AppRoutes.EHS_INCIDENT_ANALYSIS_UPDATE(incidentDetails.id)}?stepId=${currentStep - 1}`
      );
    }
  };

  const handleNext = () => {
    setIsSubmitting(true);
    router.replace(
      `${AppRoutes.EHS_INCIDENT_ANALYSIS_UPDATE(incidentDetails.id)}?stepId=${currentStep + 1}`
    );
  };

  return (
    <>
      <div className="p-2 space-y-8 rounded-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">
            Corrective & Preventive Actions
          </h1>
          <Badge variant="outline" className="text-sm font-medium py-1 px-3">
            Severity Level: {incidentDetails.severity_level}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Corrective Actions Card */}
          <Card className="border-l-4 border-l-primary shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-semibold text-gray-800">
                  Corrective Actions
                </CardTitle>
              </div>
              <CardDescription>
                Immediate steps to address safety violations
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              {incidentDetails?.corrective_actions ? (
                <ul className="space-y-2 pl-1">
                  {incidentDetails?.corrective_actions?.map((action, index) => (
                    <li key={action + index} className="flex items-start gap-2">
                      <Circle
                        className="h-2 w-2 text-primary mt-2 flex-shrink-0"
                        fill="currentColor"
                      />
                      <span className="text-gray-700">{action}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-700">
                  No corrective actions specified
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preventive Actions Card */}
          <Card className="border-l-4 border-l-primary shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-semibold text-gray-800">
                  Preventive Actions
                </CardTitle>
              </div>
              <CardDescription>
                Long-term measures to prevent recurrence
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              {incidentDetails?.preventive_actions ? (
                <ul className="space-y-2 pl-1">
                  {incidentDetails?.preventive_actions?.map((action, index) => (
                    <li key={action + index} className="flex items-start gap-2">
                      <Circle
                        className="h-2 w-2 text-primary mt-2 flex-shrink-0"
                        fill="currentColor"
                      />
                      <span className="text-gray-700">{action}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-700">
                  No Preventive actions specified
                </div>
              )}
            </CardContent>
          </Card>

          {/* VIVA Analysis Card */}
          <Card className="border-l-4 border-l-primary shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-semibold text-gray-800">
                  5 WHYs
                </CardTitle>
              </div>
              <CardDescription>Root cause analysis</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              {fiveWhysAnalysis && fiveWhysAnalysis.points ? (
                <div className="space-y-4">
                  {fiveWhysAnalysis?.points?.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Circle
                        className="h-2 w-2 text-primary mt-2 flex-shrink-0"
                        fill="currentColor"
                      />
                      <span className="text-gray-700">
                        <strong>{item.question}</strong> {item.answer}
                      </span>
                    </li>
                  ))}
                </div>
              ) : (
                <div className="text-gray-700">
                  No 5 WHYs analysis available for this incident
                </div>
              )}
            </CardContent>
          </Card>

          {/* Root Cause Analysis Card */}
          <Card className="border-l-4 border-l-primary shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-semibold text-gray-800">
                  Root Cause Analysis (RCA)
                </CardTitle>
              </div>
              <CardDescription>
                Structured analysis of causes and systemic gaps
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2 space-y-5">
              {/* Immediate Cause */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  Immediate Cause
                </p>
                <p className="text-gray-700 text-sm">
                  {incidentDetails.immediate_cause || 'Not available'}
                </p>
              </div>

              {/* Contributing Factors */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Contributing Factors
                </p>
                {contributingFactors ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(
                      [
                        'people',
                        'process',
                        'equipment',
                        'environment'
                      ] as const
                    ).map(key => (
                      <div
                        key={key}
                        className="bg-gray-50 rounded-md p-3 border border-gray-200"
                      >
                        <p className="text-xs font-semibold text-primary uppercase mb-1">
                          {key}
                        </p>
                        <p className="text-gray-700 text-sm">
                          {contributingFactors[key] || 'Not Applicable'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-700 text-sm">Not available</p>
                )}
              </div>

              {/* Root Causes (Why-Why) */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Root Causes (Why-Why)
                </p>
                {rootCauses?.points?.length ? (
                  <ul className="space-y-2 pl-1">
                    {rootCauses.points.map((point, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Circle
                          className="h-2 w-2 text-primary mt-2 flex-shrink-0"
                          fill="currentColor"
                        />
                        <span className="text-gray-700 text-sm">
                          <strong>{point.cause}</strong>
                          {' → '}
                          {point.effect}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-700 text-sm">Not available</p>
                )}
              </div>

              {/* System Gaps */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  System Gaps Identified
                </p>
                {systemGaps?.length ? (
                  <ul className="space-y-2 pl-1">
                    {systemGaps.map((gap, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Circle
                          className="h-2 w-2 text-primary mt-2 flex-shrink-0"
                          fill="currentColor"
                        />
                        <span className="text-gray-700 text-sm">{gap}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-700 text-sm">Not available</p>
                )}
              </div>

              {/* RCA Conclusion */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  RCA Conclusion
                </p>
                <p className="text-gray-700 text-sm">
                  {incidentDetails.rca_conclusion || 'Not available'}
                </p>
              </div>
            </CardContent>
          </Card>

          <IncidentFlowchart flowchartPoints={flowchartPoints} />

          <div className="mt-6">
            <div className="flex flex-col-reverse gap-2 xs:flex-row justify-between">
              {currentStep > 1 && (
                <Button
                  type="button"
                  onClick={handlePrevious}
                  variant="outline"
                  className="px-6"
                  disabled={isSubmitting}
                >
                  Previous
                </Button>
              )}
              <Button
                type="submit"
                className="px-6 capitalize text-sm sm:ml-auto"
                onClick={handleNext}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit & Next'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CorrectivePreventiveActionStep;
