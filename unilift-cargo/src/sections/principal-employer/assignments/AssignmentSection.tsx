import Spinner from '@/components/loaders/Spinner';
import React, { Suspense } from 'react';
import AssignmentsTable from './assignment-table/AssignmentsTable';
import { fetchEmployeePPEHistoryPUser } from '@/actions/principal-employer/principal';
import { SearchParamsType } from '@/types/index.types';

const AssignmentSection = ({ searchParams }: SearchParamsType) => {
  const uniqueCode = searchParams?.uniqueCode as string;
  const assignmentPromise = fetchEmployeePPEHistoryPUser(uniqueCode);

  return (
    <>
      {uniqueCode === undefined ? (
        <div className="relative w-full h-full">
          <Spinner className="absolute inset-0 w-full h-full grid place-content-center" />
        </div>
      ) : (
        <Suspense
          fallback={
            <div className="relative w-full h-full">
              <Spinner className="absolute inset-0 w-full h-full grid place-content-center" />
            </div>
          }
        >
          <AssignmentsTable assignmentPromise={assignmentPromise} />
        </Suspense>
      )}
    </>
  );
};

export default AssignmentSection;
