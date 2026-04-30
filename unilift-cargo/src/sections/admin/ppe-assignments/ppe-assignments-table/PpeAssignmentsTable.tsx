'use client';

import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { DataTableFilterField } from '@/types/data-table.types';
import { getPpeAssignmentsColumns } from './PpeAssignmentsColumn';
import { FetchContractorType } from '@/actions/admin/contractor';
import { useMemo, useState } from 'react';
import AssignPpeModal from '../AssignPpeModal';

type Props = {
  contractors: {
    success: boolean;
    message: string;
    data?: FetchContractorType[];
    pageCount?: number;
  };
};

export default function PpeAssignmentsTable({ contractors }: Props) {
  const { data = [], pageCount = 1 } = contractors;
  const [selectedContractor, setSelectedContractor] = useState<FetchContractorType | null>(null);

  const columns = useMemo(
    () => getPpeAssignmentsColumns(setSelectedContractor),
    []
  );

  const filterFields: DataTableFilterField<FetchContractorType>[] = [
    {
      label: 'Customer Name',
      value: 'first_name',
      placeholder: 'Filter by name...'
    }
  ];

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    filterFields,
    initialState: { columnPinning: { right: ['actions'] } },
    getRowId: (originalRow, index) => `${originalRow.id}-${index}`
  });

  return (
    <>
      <DataTable table={table}>
        <DataTableToolbar table={table} filterFields={filterFields} />
      </DataTable>

      {selectedContractor && (
        <AssignPpeModal
          contractor={selectedContractor}
          open={!!selectedContractor}
          onClose={() => setSelectedContractor(null)}
        />
      )}
    </>
  );
}
