import { Suspense } from 'react';
import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import { AppRoutes } from '@/constants/AppRoutes';
import StaffListingSection from '@/sections/admin/staff/StaffListingSection';
import Spinner from '@/components/loaders/Spinner';

const BREADCRUMBS = [
  { label: 'Dashboard', route: AppRoutes.ADMIN_DASHBOARD },
  { label: 'Staff', route: AppRoutes.ADMIN_STAFF_LISTING }
] as const;

const AdminStaffListingPage = () => {
  return (
    <AdminTopbarLayout title="Staff Management" breadcrumbOptions={BREADCRUMBS}>
      <Suspense
        fallback={
          <div className="flex justify-center items-center w-full h-[50vh]">
            <Spinner />
          </div>
        }
      >
        <StaffListingSection />
      </Suspense>
    </AdminTopbarLayout>
  );
};

export default AdminStaffListingPage;
