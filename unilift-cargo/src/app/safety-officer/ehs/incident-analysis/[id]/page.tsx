import { notFound } from 'next/navigation';
import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import { AppRoutes } from '@/constants/AppRoutes';
import { getIncidentDetailsById } from '@/actions/contractor/incident-analysis';
import SoIncidentDetailSection from '@/sections/safety-officer/ehs/SoIncidentDetailSection';

interface Props {
  params: { id: string };
}

const SoIncidentDetailPage = async ({ params }: Props) => {
  const incidentResult = await getIncidentDetailsById(Number(params.id));

  if (!incidentResult.success || !incidentResult.data) return notFound();

  const incident = incidentResult.data;

  const BREADCRUMBS = [
    { label: 'Dashboard', route: AppRoutes.SAFETY_OFFICER_DASHBOARD },
    { label: 'Incident Analysis', route: AppRoutes.SAFETY_OFFICER_EHS_INCIDENT_ANALYSIS_LISTING },
    { label: incident.title, route: AppRoutes.SAFETY_OFFICER_EHS_INCIDENT_ANALYSIS_DETAILS(Number(params.id)) }
  ] as const;

  return (
    <AdminTopbarLayout title={incident.title} breadcrumbOptions={BREADCRUMBS}>
      <SoIncidentDetailSection incident={incident} />
    </AdminTopbarLayout>
  );
};

export default SoIncidentDetailPage;
