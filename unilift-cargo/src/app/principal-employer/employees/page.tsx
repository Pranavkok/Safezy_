import Spinner from '@/components/loaders/Spinner';
import { AppRoutes } from '@/constants/AppRoutes';
import PrincipalEmployerTopbarLayout from '@/layouts/PrincipalEmployerTopbarLayout';
import PrincipalEmployeeListingSection from '@/sections/principal-employer/employees/PrincipalEmployeeListingSection';
import { SearchParamsType } from '@/types/index.types';
import React, { Suspense } from 'react';

const PrincipalEmployerEmployeeListingPageBreadcrumbs = [
  { label: 'Dashboard', route: `${AppRoutes.PRINCIPAL_EMPLOYER_DASHBOARD}` },
  {
    label: 'Employees',
    route: `${AppRoutes.PRINCIPAL_EMPLOYER_EMPLOYEE_LISTING}`
  }
] as const;

const PrincipalEmployerEmployeeListingPage = async ({
  searchParams
}: SearchParamsType) => {
  return (
    <PrincipalEmployerTopbarLayout
      title="Employee"
      breadcrumbOptions={PrincipalEmployerEmployeeListingPageBreadcrumbs}
    >
      <Suspense
        fallback={
          <Spinner className="absolute inset-0 w-full h-full grid place-content-center" />
        }
      >
        <PrincipalEmployeeListingSection searchParams={searchParams} />
      </Suspense>
    </PrincipalEmployerTopbarLayout>
  );
};

export default PrincipalEmployerEmployeeListingPage;
