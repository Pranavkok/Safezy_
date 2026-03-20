import Spinner from '@/components/loaders/Spinner';
import WorksiteSelect from '@/components/WorksiteSelect';
import { AppRoutes } from '@/constants/AppRoutes';
import ContractorTopbarLayout from '@/layouts/ContractorTopbarLayout';
import AssignmentSection from '@/sections/contractor/assignments/AssignmentSection';
import { SearchParamsType } from '@/types/index.types';
import React, { Suspense } from 'react';

const BREADCRUMBS = [
  {
    label: 'Dashboard',
    route: AppRoutes.CONTRACTOR_DASHBOARD
  },
  {
    label: 'Assignments',
    route: AppRoutes.CONTRACTOR_ASSIGNMENTS
  }
];
const ContractorAssignmentsPage = ({ searchParams }: SearchParamsType) => {
  return (
    <ContractorTopbarLayout title="Assignments" breadcrumbOptions={BREADCRUMBS}>
      <div className="flex justify-center items-center gap-4 mb-6">
        <WorksiteSelect dynamicText="assignments" />
      </div>

      <Suspense
        key={searchParams?.worksite}
        fallback={
          <div className="flex justify-center items-center w-full h-[50vh]">
            <Spinner />
          </div>
        }
      >
        <AssignmentSection searchParams={searchParams} />
      </Suspense>
    </ContractorTopbarLayout>
  );
};

export default ContractorAssignmentsPage;
