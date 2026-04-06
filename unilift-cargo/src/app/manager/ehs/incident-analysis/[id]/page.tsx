export const dynamic = 'force-dynamic';

import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import { AppRoutes } from '@/constants/AppRoutes';
import { getSafetyOfficersList } from '@/actions/manager/ehs';
import { getIncidentDetailsById } from '@/actions/contractor/incident-analysis';
import ManagerIncidentDetailSection from '@/sections/manager/ehs/ManagerIncidentDetailSection';

interface Props {
  params: { id: string };
}

const ManagerIncidentDetailPage = async ({ params }: Props) => {
  const [incidentResult, officersResult] = await Promise.all([
    getIncidentDetailsById(Number(params.id)),
    getSafetyOfficersList()
  ]);

  if (!incidentResult.success || !incidentResult.data) {
    return (
      <AdminTopbarLayout title="Incident Analysis">
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-600">
          Failed to load the incident details. Please go back and try again.
        </div>
      </AdminTopbarLayout>
    );
  }

  const incident = incidentResult.data;
  const safetyOfficers = officersResult.data ?? [];

  const BREADCRUMBS = [
    { label: 'Dashboard', route: AppRoutes.MANAGER_DASHBOARD },
    { label: 'Incident Analysis', route: AppRoutes.MANAGER_EHS_INCIDENT_ANALYSIS_LISTING },
    { label: incident.title, route: AppRoutes.MANAGER_EHS_INCIDENT_ANALYSIS_DETAILS(Number(params.id)) }
  ] as const;

  return (
    <AdminTopbarLayout title={incident.title} breadcrumbOptions={BREADCRUMBS}>
      <ManagerIncidentDetailSection incident={incident} safetyOfficers={safetyOfficers} />
    </AdminTopbarLayout>
  );
};

export default ManagerIncidentDetailPage;
