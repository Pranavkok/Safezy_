import React from 'react';
import { fetchContractors } from '@/actions/admin/contractor';
import { SearchParamsType } from '@/types/index.types';
import PpeAssignmentsTable from './ppe-assignments-table/PpeAssignmentsTable';

const PpeAssignmentsSection = async ({ searchParams }: SearchParamsType) => {
  const searchQuery = searchParams.first_name ?? undefined;
  const sortParam = searchParams.sort ?? undefined;
  const page = parseInt(searchParams.page ?? '1');
  const pageSize = parseInt(searchParams.per_page ?? '10');

  const [sortBy, sortOrder] = sortParam ? sortParam.split('.') : [];

  const contractors = await fetchContractors(searchQuery, sortBy, sortOrder, page, pageSize);

  return <PpeAssignmentsTable contractors={contractors} />;
};

export default PpeAssignmentsSection;
