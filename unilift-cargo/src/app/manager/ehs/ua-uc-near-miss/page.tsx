export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import { AppRoutes } from '@/constants/AppRoutes';
import { getAllUaUcReports } from '@/actions/manager/ehs';
import ManagerUaUcListingSection from '@/sections/manager/ehs/ManagerUaUcListingSection';
import Spinner from '@/components/loaders/Spinner';

const BREADCRUMBS = [
  { label: 'Dashboard', route: AppRoutes.MANAGER_DASHBOARD },
  { label: 'UA / UC / Near Miss', route: AppRoutes.MANAGER_EHS_UA_UC_NEAR_MISS_LISTING }
] as const;

const ManagerUaUcListingPage = async () => {
  const result = await getAllUaUcReports();
  const reports = result.data ?? [];

  return (
    <AdminTopbarLayout title="UA / UC / Near Miss Reports" breadcrumbOptions={BREADCRUMBS}>
      <Suspense fallback={<div className="flex justify-center items-center h-[50vh]"><Spinner /></div>}>
        <ManagerUaUcListingSection reports={reports} />
      </Suspense>
    </AdminTopbarLayout>
  );
};

export default ManagerUaUcListingPage;
