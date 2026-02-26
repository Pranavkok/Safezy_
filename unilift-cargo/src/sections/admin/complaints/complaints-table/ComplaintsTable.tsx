'use client';
'use memo';

import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { DataTableFilterField } from '@/types/data-table.types';
import { getComplaintsColumns } from './ComplaintsColumn';
import { ComplaintListingType } from '@/types/complaint.types';
import { useMemo } from 'react';

export type ComplaintsTablePropsType = {
  complaints: {
    success: boolean;
    message: string;
    data?: ComplaintListingType[];
    pageCount?: number;
  };
};

export function ComplaintsTable({ complaints }: ComplaintsTablePropsType) {
  const { data = [], pageCount = 1 } = complaints;

  const columns = useMemo(() => getComplaintsColumns(), []);

  const filterFields: DataTableFilterField<ComplaintListingType>[] = [
    {
      label: 'User Name',
      value: 'first_name',
      placeholder: 'Filter titles...'
    }
  ];

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    filterFields,
    initialState: {
      columnPinning: { right: ['actions'] }
    },
    getRowId: (originalRow, index) => `${originalRow.id}-${index}`
  });

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} filterFields={filterFields} />
    </DataTable>
  );
}
