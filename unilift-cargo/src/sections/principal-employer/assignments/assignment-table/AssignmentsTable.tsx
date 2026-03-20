'use client';

import React from 'react';
import { DataTable } from '@/components/data-table/data-table';
import { useDataTable } from '@/hooks/use-data-table';
import { getAssignmentColumns } from './AssignmentsColumn';
import { fetchEmployeePPEHistory } from '@/actions/contractor/employee';
import { EmployeePPEHistoryType } from '@/types/employee.types';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';

export type AssignmentType = {
  id: string;
};

export interface AssignmentPropsType {
  assignmentPromise: ReturnType<typeof fetchEmployeePPEHistory>;
}

const AssignmentsTable = ({ assignmentPromise }: AssignmentPropsType) => {
  const { data = [], productNames = [] } = React.use(assignmentPromise);
  const columns = React.useMemo(
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
