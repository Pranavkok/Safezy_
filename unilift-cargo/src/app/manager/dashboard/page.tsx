import { Suspense } from 'react';
import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import { AppRoutes } from '@/constants/AppRoutes';
import ManagerDashboardSection from '@/sections/manager/ManagerDashboardSection';
import Spinner from '@/components/loaders/Spinner';

const BREADCRUMBS = [
  { label: 'Dashboard', route: AppRoutes.MANAGER_DASHBOARD }
] as const;

const ManagerDashboardPage = () => {
  return (
    <AdminTopbarLayout title="Manager Dashboard" breadcrumbOptions={BREADCRUMBS}>
      <Suspense
        fallback={
          <div className="flex justify-center items-center w-full h-[50vh]">
            <Spinner />
          </div>
        }
      >
        <ManagerDashboardSection />
      </Suspense>
    </AdminTopbarLayout>
  );
};

export default ManagerDashboardPage;
