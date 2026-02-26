import { getIncidentDetailsById } from '@/actions/contractor/incident-analysis';
import { fetchIncidentMetadataById } from '@/actions/metadata';
import IncidentReport from '@/sections/ehs/incident-analysis/IncidentReport';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export async function generateMetadata({
  params
}: {
  params: { id: number };
}): Promise<Metadata> {
  return await fetchIncidentMetadataById(params.id);
}

const IncidentReportPage = async ({ params }: { params: { id: number } }) => {
  const incidentId = params.id;

  const { data: incidentDetails, success } =
    await getIncidentDetailsById(incidentId);

  if (!success || !incidentDetails) {
    notFound();
  }
  return <IncidentReport incidentDetails={incidentDetails} />;
};

export default IncidentReportPage;
