'use client';
'use memo';

import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { DataTableFilterField } from '@/types/data-table.types';
import { getEmployeeListingColumns } from './EmployeeListingColumn';
import { EmployeeType } from '@/types/index.types';
import { useMemo } from 'react';

export type EmployeeListingType = {
  id: string;
  equipment_id: string;
  work_site: string;
  employee_name: string;
  assigned_equipments: string;
  employee_contact: string;
};

export interface EmployeeListingPropsType {
  employeeListing: {
    success: boolean;
    message: string;
    data?: EmployeeType[];
    pageCount?: number;
  };
}

export function EmployeeListingTable({
  employeeListing
}: EmployeeListingPropsType) {
  const { data = [], pageCount = 1 } = employeeListing;

  const columns = useMemo(() => getEmployeeListingColumns(), []);

  const filterFields: DataTableFilterField<EmployeeType>[] = [
    {
      label: 'Employee Name',
      value: 'name',
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
      <DataTableToolbar
        table={table}
        filterFields={filterFields}
      ></DataTableToolbar>
    </DataTable>
  );
}
