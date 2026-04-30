import { Suspense } from 'react';
import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import { AppRoutes } from '@/constants/AppRoutes';
import PpeAssignmentsSection from '@/sections/admin/ppe-assignments/PpeAssignmentsSection';
import Spinner from '@/components/loaders/Spinner';
import { SearchParamsType } from '@/types/index.types';

const BREADCRUMBS = [
  { label: 'Dashboard', route: AppRoutes.MANAGER_DASHBOARD },
  { label: 'PPE Assignments', route: AppRoutes.MANAGER_PPE_ASSIGNMENTS }
] as const;

const ManagerPpeAssignmentsPage = ({ searchParams }: SearchParamsType) => {
  return (
    <AdminTopbarLayout title="PPE Assignments" breadcrumbOptions={BREADCRUMBS}>
      <Suspense
        fallback={
          <div className="flex justify-center items-center w-full h-[50vh]">
            <Spinner />
          </div>
        }
      >
        <PpeAssignmentsSection searchParams={searchParams} />
      </Suspense>
    </AdminTopbarLayout>
  );
};

export default ManagerPpeAssignmentsPage;
