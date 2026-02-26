import Spinner from '@/components/loaders/Spinner';
import { AppRoutes } from '@/constants/AppRoutes';
import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import ComplaintsSection from '@/sections/admin/complaints/ComplaintsSection';
import { SearchParamsType } from '@/types/index.types';
import { Suspense } from 'react';

const BREADCRUMBS = [
  { label: 'Dashboard', route: AppRoutes.ADMIN_DASHBOARD },
  { label: 'Complaints', route: AppRoutes.ADMIN_COMPLAINTS }
] as const;

const AdminComplaintsListingPage = ({ searchParams }: SearchParamsType) => {
  return (
    <AdminTopbarLayout title="Complaints" breadcrumbOptions={BREADCRUMBS}>
      <Suspense
        fallback={
          <div className="flex justify-center items-center w-full h-[50vh]">
            <Spinner />
          </div>
        }
      >
        <ComplaintsSection searchParams={searchParams} />
      </Suspense>
    </AdminTopbarLayout>
  );
};

export default AdminComplaintsListingPage;
