import { Suspense } from 'react';
import ContractorTopbarLayout from '@/layouts/ContractorTopbarLayout';
import DashboardSection from '@/sections/contractor/dashboard/DashboardSection';
import Spinner from '@/components/loaders/Spinner';

const ContractorDashboardPage = () => {
  return (
    <ContractorTopbarLayout title="Dashboard">
      <Suspense
        fallback={
          <div className="flex justify-center items-center w-full h-[50vh]">
            <Spinner />
          </div>
        }
      >
        <DashboardSection />
      </Suspense>
    </ContractorTopbarLayout>
  );
};

export default ContractorDashboardPage;
