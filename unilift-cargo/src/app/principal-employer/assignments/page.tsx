import React from 'react';
import PrincipalEmployerTopbarLayout from '@/layouts/PrincipalEmployerTopbarLayout';
import { SearchParamsType } from '@/types/index.types';
import AssignmentSection from '@/sections/principal-employer/assignments/AssignmentSection';

const PrincipalEmployerEmployeeListingPage = ({
  searchParams
}: SearchParamsType) => {
  return (
    <PrincipalEmployerTopbarLayout title="Assignments">
      <AssignmentSection searchParams={searchParams} />
    </PrincipalEmployerTopbarLayout>
  );
};

export default PrincipalEmployerEmployeeListingPage;
