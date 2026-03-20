import React, { Suspense } from 'react';
import Spinner from '@/components/loaders/Spinner';
import { SearchParamsType } from '@/types/index.types';
import { PrincipleListingTable } from './principles-listing-table/PrinciplesListingTable';
import { getAllFirstPrinciples } from '@/actions/admin/ehs/first-principles';

const ToolboxTalkListingSection = async ({
  searchParams
}: SearchParamsType) => {
  const searchQuery = searchParams?.title ?? '';
  const page = parseInt(searchParams?.page ?? '1');
  const pageSize = parseInt(searchParams?.per_page ?? '10');

  const firstPrinciples = await getAllFirstPrinciples(
    searchQuery,
    page,
    pageSize
  );

  return (
    <Suspense
      fallback={
        <Spinner className="absolute inset-0 w-full h-full grid place-content-center" />
      }
    >
      <PrincipleListingTable firstPrinciples={firstPrinciples} />
    </Suspense>
  );
};

export default ToolboxTalkListingSection;
