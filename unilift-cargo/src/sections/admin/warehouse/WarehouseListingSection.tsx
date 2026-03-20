import React, { Suspense } from 'react';
import { WarehouseListingTable } from './warehouse-listing-table/WarehouseListingTable';
import { fetchAllWarehouseOperators } from '@/actions/warehouse-operator/warehouse';
import { SearchParamsType } from '@/types/index.types';
import Spinner from '@/components/loaders/Spinner';

const WarehouseListingSection: React.FC<SearchParamsType> = async ({
  searchParams
}) => {
  const searchQuery = searchParams?.first_name ?? undefined;
  const sortParam = searchParams?.sort ?? undefined;
  const page = parseInt(searchParams?.page ?? '1');
  const pageSize = parseInt(searchParams?.per_page ?? '10');
  const [sortBy = 'first_name', sortOrder = 'asc'] = sortParam
    ? sortParam.split('.')
    : [];

  const warehouses = await fetchAllWarehouseOperators({
    searchQuery,
    sortBy,
    sortOrder,
    page,
    pageSize
  });

  return (
    <Suspense
      fallback={
        <Spinner className="absolute inset-0 w-full h-full grid place-content-center" />
      }
    >
      <WarehouseListingTable warehouses={warehouses} />
    </Suspense>
  );
};

export default WarehouseListingSection;
