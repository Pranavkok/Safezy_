'use client';
'use memo';

import { useMemo } from 'react';
import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { DataTableFilterField } from '@/types/data-table.types';
import { EmployeeType } from '@/types/index.types';
import AddNewEmployeeModal from '@/components/modals/AddNewEmployeeModal';
import AddEmployeeFromCsv from '@/components/modals/AddEmployeeFromCsv';
import { Button } from '@/components/ui/button';
import { downloadSampleCSV } from '@/utils/downloadSampleCSV';
import { getEmployeeListingColumns } from './EmployeeListingColumn';

type EmployeeListingPropsType = {
  employeeListingPromise: {
    data?: EmployeeType[];
    pageCount?: number;
  };
};

export function EmployeeListingTable({
  employeeListingPromise
}: EmployeeListingPropsType) {
  const { data = [], pageCount = 1 } = employeeListingPromise;

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
      <DataTableToolbar table={table} filterFields={filterFields}>
        <Button onClick={downloadSampleCSV}>Download sample csv</Button>
        <AddEmployeeFromCsv />
        <AddNewEmployeeModal />
      </DataTableToolbar>
    </DataTable>
  );
}
