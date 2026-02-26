import React, { Suspense } from 'react';
import { ContractorListingTable } from '@/sections/admin/contractors/contractors-table/ContractorListingTable';
import Spinner from '@/components/loaders/Spinner';
import { fetchContractors } from '@/actions/admin/contractor';
import { SearchParamsType } from '@/types/index.types';

const ContractorListingSection = async ({ searchParams }: SearchParamsType) => {
  const searchQuery = searchParams.first_name ?? undefined;
  const sortParam = searchParams.sort ?? undefined;
  const page = parseInt(searchParams.page ?? '1');
  const pageSize = parseInt(searchParams.per_page ?? '10');

  const [sortBy, sortOrder] = sortParam ? sortParam.split('.') : [];

  const contractors = await fetchContractors(
    searchQuery,
    sortBy,
    sortOrder,
    page,
    pageSize
  );

  return (
    <Suspense
      fallback={
        <Spinner className="absolute inset-0 w-full h-full grid place-content-center" />
      }
    >
      <ContractorListingTable contractors={contractors} />
    </Suspense>
  );
};

export default ContractorListingSection;
