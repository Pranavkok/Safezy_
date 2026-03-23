import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import { AppRoutes } from '@/constants/AppRoutes';
import dynamic from 'next/dynamic';

const AddStaffSection = dynamic(
  () => import('@/sections/admin/staff/AddStaffSection'),
  { ssr: false }
);

const BREADCRUMBS = [
  { label: 'Dashboard', route: AppRoutes.ADMIN_DASHBOARD },
  { label: 'Staff', route: AppRoutes.ADMIN_STAFF_LISTING },
  { label: 'Add Staff', route: AppRoutes.ADMIN_STAFF_ADD }
] as const;

const AdminAddStaffPage = () => {
  return (
    <AdminTopbarLayout title="Add Staff Member" breadcrumbOptions={BREADCRUMBS}>
      <AddStaffSection />
    </AdminTopbarLayout>
  );
};

export default AdminAddStaffPage;
