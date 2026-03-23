import { Suspense } from 'react';
import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import { AppRoutes } from '@/constants/AppRoutes';
import { getMyAssignedUaUcReports } from '@/actions/safety-officer/ehs';
import SoUaUcListingSection from '@/sections/safety-officer/ehs/SoUaUcListingSection';
import Spinner from '@/components/loaders/Spinner';

const BREADCRUMBS = [
  { label: 'Dashboard', route: AppRoutes.SAFETY_OFFICER_DASHBOARD },
  { label: 'UA / UC / Near Miss', route: AppRoutes.SAFETY_OFFICER_EHS_UA_UC_NEAR_MISS_LISTING }
] as const;

const SoUaUcListingPage = async () => {
  const result = await getMyAssignedUaUcReports();
  const reports = result.data ?? [];

  return (
    <AdminTopbarLayout title="My UA / UC / Near Miss Assignments" breadcrumbOptions={BREADCRUMBS}>
      <Suspense fallback={<div className="flex justify-center items-center h-[50vh]"><Spinner /></div>}>
        <SoUaUcListingSection reports={reports} />
      </Suspense>
    </AdminTopbarLayout>
  );
};

export default SoUaUcListingPage;
