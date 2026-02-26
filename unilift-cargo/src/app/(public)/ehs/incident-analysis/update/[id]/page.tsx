import { getIncidentDetailsById } from '@/actions/contractor/incident-analysis';
import IncidentReportStepper from '@/sections/ehs/incident-analysis';
import { notFound } from 'next/navigation';
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

  return <IncidentReportStepper incidentDetails={incidentDetails} />;
};

export default ContractorIncidentAnalysisUpdatePage;
