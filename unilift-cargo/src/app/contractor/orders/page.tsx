import React, { Suspense } from 'react';
import { AppRoutes } from '@/constants/AppRoutes';
import ContractorOrderListingSection from '@/sections/contractor/orders/OrderListingSection';
import ContractorTopbarLayout from '@/layouts/ContractorTopbarLayout';
import { SearchParamsType } from '@/types/index.types';
import Spinner from '@/components/loaders/Spinner';
import WorksiteSelect from '@/components/WorksiteSelect';

const BREADCRUMBS = [
  { label: 'Dashboard', route: AppRoutes.CONTRACTOR_DASHBOARD },
  {
    label: 'Orders',
    route: AppRoutes.CONTRACTOR_ORDER_LISTING
  }
] as const;

const ContractorOrderListingPage = ({ searchParams }: SearchParamsType) => {
  return (
    <ContractorTopbarLayout title="Orders" breadcrumbOptions={BREADCRUMBS}>
      <div className="flex justify-center items-center gap-4 mb-6">
        <WorksiteSelect dynamicText="orders" />
      </div>
      <Suspense
        key={searchParams?.worksite}
        fallback={
          <div className="flex justify-center items-center w-full h-[50vh]">
            <Spinner />
          </div>
        }
      >
        <ContractorOrderListingSection searchParams={searchParams} />
      </Suspense>
    </ContractorTopbarLayout>
  );
};

export default ContractorOrderListingPage;
