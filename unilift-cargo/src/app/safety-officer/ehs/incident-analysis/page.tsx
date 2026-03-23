import { Suspense } from 'react';
import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import { AppRoutes } from '@/constants/AppRoutes';
import { getMyAssignedIncidents } from '@/actions/safety-officer/ehs';
import SoIncidentListingSection from '@/sections/safety-officer/ehs/SoIncidentListingSection';
import Spinner from '@/components/loaders/Spinner';

const BREADCRUMBS = [
  { label: 'Dashboard', route: AppRoutes.SAFETY_OFFICER_DASHBOARD },
  { label: 'Incident Analysis', route: AppRoutes.SAFETY_OFFICER_EHS_INCIDENT_ANALYSIS_LISTING }
] as const;

const SoIncidentListingPage = async () => {
  const result = await getMyAssignedIncidents();
  const incidents = result.data ?? [];

  return (
    <AdminTopbarLayout title="My Incident Assignments" breadcrumbOptions={BREADCRUMBS}>
      <Suspense fallback={<div className="flex justify-center items-center h-[50vh]"><Spinner /></div>}>
        <SoIncidentListingSection incidents={incidents} />
      </Suspense>
    </AdminTopbarLayout>
  );
};

export default SoIncidentListingPage;
