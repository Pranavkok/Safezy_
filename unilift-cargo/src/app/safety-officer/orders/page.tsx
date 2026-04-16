import React, { Suspense } from 'react';
import { AppRoutes } from '@/constants/AppRoutes';
import ContractorOrderListingSection from '@/sections/contractor/orders/OrderListingSection';
import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import { SearchParamsType } from '@/types/index.types';
import Spinner from '@/components/loaders/Spinner';
import WorksiteSelect from '@/components/WorksiteSelect';

const BREADCRUMBS = [
  { label: 'Dashboard', route: AppRoutes.SAFETY_OFFICER_DASHBOARD },
  { label: 'Orders', route: AppRoutes.SAFETY_OFFICER_ORDER_LISTING }
] as const;

const SafetyOfficerOrderListingPage = ({ searchParams }: SearchParamsType) => {
  return (
    <AdminTopbarLayout title="Orders" breadcrumbOptions={BREADCRUMBS}>
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
    </AdminTopbarLayout>
  );
};

export default SafetyOfficerOrderListingPage;
