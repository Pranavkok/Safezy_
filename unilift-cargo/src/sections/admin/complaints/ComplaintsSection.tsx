import React, { Suspense } from 'react';
import { ComplaintsTable } from './complaints-table/ComplaintsTable';
import Spinner from '@/components/loaders/Spinner';
import { getComplaints } from '@/actions/admin/complaints';
import { SearchParamsType } from '@/types/index.types';

const ComplaintsSection = async ({ searchParams }: SearchParamsType) => {
  const searchQuery = searchParams.first_name ?? undefined;
  const sortParam = searchParams.sort ?? undefined;
  const page = parseInt(searchParams.page ?? '1');
  const pageSize = parseInt(searchParams.per_page ?? '10');

  const [sortBy, sortOrder] = sortParam ? sortParam.split('.') : [];

  const complaints = await getComplaints({
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
      <ComplaintsTable complaints={complaints} />
    </Suspense>
  );
};

export default ComplaintsSection;
