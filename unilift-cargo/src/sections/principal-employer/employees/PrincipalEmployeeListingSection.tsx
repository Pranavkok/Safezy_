import React, { Suspense } from 'react';
import { EmployeeListingTable } from './employees-table/EmployeeListingTable';
import Spinner from '@/components/loaders/Spinner';
import { SearchParamsType } from '@/types/index.types';
import { getEmployeePUser } from '@/actions/principal-employer/principal';

const PrincipalEmployeeListingSection = async ({
  searchParams
}: SearchParamsType) => {
  const uniqueCode = searchParams?.uniqueCode as string;
  const searchQuery = searchParams?.name || undefined;
  const sortParam = searchParams?.sort || undefined;
  const page = parseInt(searchParams?.page || '1', 10);
  const pageSize = parseInt(searchParams?.per_page || '10', 10);
  const [sortBy = 'first_name', sortOrder = 'asc'] = sortParam
    ? sortParam.split('.')
    : [];

  const employeeListing = await getEmployeePUser(
    uniqueCode,
    searchQuery,
    sortBy,
    sortOrder,
    page,
    pageSize
  );

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
          <EmployeeListingTable employeeListing={employeeListing} />
        </Suspense>
      )}
    </>
  );
};

export default PrincipalEmployeeListingSection;
