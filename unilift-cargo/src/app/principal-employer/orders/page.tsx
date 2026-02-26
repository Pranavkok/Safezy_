import React, { Suspense } from 'react';
import { AppRoutes } from '@/constants/AppRoutes';
import PrincipalEmployerTopbarLayout from '@/layouts/PrincipalEmployerTopbarLayout';
import PrincipalEmployerOrderListingSection from '@/sections/principal-employer/orders/OrderListingSection';
import { SearchParamsType } from '@/types/index.types';
import Spinner from '@/components/loaders/Spinner';

const PrincipalEmployerOrderListingPageBreadcrumbs = [
  { label: 'Dashboard', route: AppRoutes.PRINCIPAL_EMPLOYER_DASHBOARD },
  {
    label: 'Orders',
    route: AppRoutes.PRINCIPAL_EMPLOYER_ORDER_LISTING
  }
] as const;

const PrincipalEmployerOrderListingPage = ({
  searchParams
}: SearchParamsType) => {
  return (
    <PrincipalEmployerTopbarLayout
      title="Orders"
      breadcrumbOptions={PrincipalEmployerOrderListingPageBreadcrumbs}
    >
      <Suspense
        fallback={
          <Spinner className="absolute inset-0 w-full h-full grid place-content-center" />
        }
      >
        <PrincipalEmployerOrderListingSection searchParams={searchParams} />
      </Suspense>
    </PrincipalEmployerTopbarLayout>
  );
};

export default PrincipalEmployerOrderListingPage;
