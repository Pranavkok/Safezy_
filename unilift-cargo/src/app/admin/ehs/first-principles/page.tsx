import React, { Suspense } from 'react';
import EHSFirstPrinciplesListingSection from '@/sections/admin/ehs/first-principles/EhsFirstPrinciplesListingSection';
import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import { AppRoutes } from '@/constants/AppRoutes';
import { SearchParamsType } from '@/types/index.types';
import Spinner from '@/components/loaders/Spinner';

const BREADCRUMBS = [
  { label: 'Dashboard', route: AppRoutes.ADMIN_DASHBOARD },
  {
    label: 'EHS First Principles',
    route: AppRoutes.ADMIN_EHS_FIRST_PRINCIPLES_LISTING
  }
] as const;

const EHSFirstPrinciplesListingPage = ({ searchParams }: SearchParamsType) => {
  return (
    <AdminTopbarLayout
      title="EHS FIRST PRINCIPLES"
      breadcrumbOptions={BREADCRUMBS}
    >
      <Suspense
        fallback={
          <div className="flex justify-center items-center w-full h-[50vh]">
            <Spinner />
          </div>
        }
      >
        <EHSFirstPrinciplesListingSection searchParams={searchParams} />
      </Suspense>
    </AdminTopbarLayout>
  );
};

export default EHSFirstPrinciplesListingPage;
