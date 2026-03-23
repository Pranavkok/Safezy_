import { Suspense } from 'react';
import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import { AppRoutes } from '@/constants/AppRoutes';
import SafetyOfficerDashboardSection from '@/sections/safety-officer/SafetyOfficerDashboardSection';
import Spinner from '@/components/loaders/Spinner';

const BREADCRUMBS = [
  { label: 'Dashboard', route: AppRoutes.SAFETY_OFFICER_DASHBOARD }
] as const;

const SafetyOfficerDashboardPage = () => {
  return (
    <AdminTopbarLayout title="Safety Officer Dashboard" breadcrumbOptions={BREADCRUMBS}>
      <Suspense
        fallback={
          <div className="flex justify-center items-center w-full h-[50vh]">
            <Spinner />
          </div>
        }
      >
        <SafetyOfficerDashboardSection />
      </Suspense>
    </AdminTopbarLayout>
  );
};

export default SafetyOfficerDashboardPage;
