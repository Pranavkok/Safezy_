import Spinner from '@/components/loaders/Spinner';
import WorksiteSelect from '@/components/WorksiteSelect';
import { AppRoutes } from '@/constants/AppRoutes';
import ContractorTopbarLayout from '@/layouts/ContractorTopbarLayout';
import EmployeeListingSection from '@/sections/contractor/employees/EmployeeListingSection';
import { SearchParamsType } from '@/types/index.types';
import React, { Suspense } from 'react';

const BREADCRUMBS = [
  { label: 'Dashboard', route: AppRoutes.CONTRACTOR_DASHBOARD },
  {
    label: 'Employees',
    route: AppRoutes.CONTRACTOR_EMPLOYEE_LISTING
  }
] as const;

const ContractorEmployeeListingPage = ({ searchParams }: SearchParamsType) => {
  return (
    <ContractorTopbarLayout title="Employee" breadcrumbOptions={BREADCRUMBS}>
      <div className="flex justify-center items-center gap-4 mb-6">
        <WorksiteSelect dynamicText="employees" />
      </div>
      <Suspense
        key={searchParams?.worksite}
        fallback={
          <div className="flex justify-center items-center w-full h-[50vh]">
            <Spinner />
          </div>
        }
      >
        <EmployeeListingSection searchParams={searchParams} />
      </Suspense>
    </ContractorTopbarLayout>
  );
};

export default ContractorEmployeeListingPage;
