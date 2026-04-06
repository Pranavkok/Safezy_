export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import { AppRoutes } from '@/constants/AppRoutes';
import { getAllIncidentReports } from '@/actions/manager/ehs';
import ManagerIncidentListingSection from '@/sections/manager/ehs/ManagerIncidentListingSection';
import Spinner from '@/components/loaders/Spinner';

const BREADCRUMBS = [
  { label: 'Dashboard', route: AppRoutes.ADMIN_DASHBOARD },
  { label: 'Incident Analysis', route: AppRoutes.ADMIN_EHS_INCIDENT_ANALYSIS_LISTING }
] as const;

const AdminIncidentListingPage = async () => {
  const result = await getAllIncidentReports();
  const incidents = result.data ?? [];

  return (
    <AdminTopbarLayout title="Incident Analysis" breadcrumbOptions={BREADCRUMBS}>
      <Suspense fallback={<div className="flex justify-center items-center h-[50vh]"><Spinner /></div>}>
        <ManagerIncidentListingSection
          incidents={incidents}
          detailRouteBase="/admin/ehs/incident-analysis"
          showExportButton
        />
      </Suspense>
    </AdminTopbarLayout>
  );
};

export default AdminIncidentListingPage;
