'use client';
'use memo';

import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { DataTableFilterField } from '@/types/data-table.types';
import { WorksiteType, WorksiteWithAddressType } from '@/types/index.types';
import AddNewWorksiteModal from '@/components/modals/contractor/worksite/AddNewWorksiteModal';
import { getWorksitesListingColumns } from './WorksitesListingColumn';
import { useMemo } from 'react';

type WorksiteListingPropsType = {
  worksites: { data?: WorksiteWithAddressType[]; pageCount?: number };
};

export function WorksiteListingTable({ worksites }: WorksiteListingPropsType) {
  const { data = [], pageCount = 1 } = worksites;

  const columns = useMemo(() => getWorksitesListingColumns(), []);

  const filterFields: DataTableFilterField<WorksiteType>[] = [
    {
      label: 'Employee Name',
      value: 'site_name',
      placeholder: 'Filter store names...'
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
      <DataTableToolbar table={table} filterFields={filterFields}>
        <AddNewWorksiteModal isForCartPage={false} />
      </DataTableToolbar>
    </DataTable>
  );
}
