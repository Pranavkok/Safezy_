'use client';

import { useMemo } from 'react';
import { DataTable } from '@/components/data-table/data-table';
import { useDataTable } from '@/hooks/use-data-table';
import { getAssignmentColumns } from './AssignmentColumn';
import { EmployeePPEHistoryType } from '@/types/employee.types';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';

type AssignmentPropsType = {
  assignments: {
    data?: EmployeePPEHistoryType[];
    productNames?: string[];
  };
};

const AssignmentsTable = ({ assignments }: AssignmentPropsType) => {
  const { data = [], productNames = [] } = assignments;

  const columns = useMemo(
    () => getAssignmentColumns(productNames),
    [productNames]
  );

  const { table } = useDataTable<EmployeePPEHistoryType>({
    data,
    columns,
    pageCount: 1
  });

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
};

export default AssignmentsTable;
