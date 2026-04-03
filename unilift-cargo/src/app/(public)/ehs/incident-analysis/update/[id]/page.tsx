import { getIncidentDetailsById } from '@/actions/contractor/incident-analysis';
import { AppRoutes } from '@/constants/AppRoutes';
import IncidentReportStepper from '@/sections/ehs/incident-analysis';
import { notFound, redirect } from 'next/navigation';
import React from 'react';

export const metadata = {
  title: 'Incident Analysis | Safezy',
  description:
    'Record and analyze incidents to enhance workplace safety and compliance.'
};

const ContractorIncidentAnalysisUpdatePage = async ({
  params
}: {
  params: { id: number };
}) => {
  const incidentId = params.id;

  const { data: incidentDetails, success } =
    await getIncidentDetailsById(incidentId);

  if (!success || !incidentDetails) {
    notFound();
  }

  const isOpen = !incidentDetails.is_completed && !incidentDetails.assigned_to_user_id;
  if (!isOpen) {
    redirect(AppRoutes.EHS_INCIDENT_ANALYSIS_REPORT(incidentId));
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <IncidentReportStepper incidentDetails={incidentDetails} />
    </div>
  );
};

export default ContractorIncidentAnalysisUpdatePage;
