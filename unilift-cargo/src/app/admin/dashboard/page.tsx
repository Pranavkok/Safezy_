import Spinner from '@/components/loaders/Spinner';
import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import AdminDashboardSection from '@/sections/admin/dashboard/AdminDashboardSection';
import { Suspense } from 'react';

const AdminDashboardPage = () => {
  return (
    <AdminTopbarLayout title="Dashboard">
      <Suspense
        fallback={
          <div className="flex justify-center items-center w-full h-[50vh]">
            <Spinner />
          </div>
        }
      >
        <AdminDashboardSection />
      </Suspense>
    </AdminTopbarLayout>
  );
};

export default AdminDashboardPage;
