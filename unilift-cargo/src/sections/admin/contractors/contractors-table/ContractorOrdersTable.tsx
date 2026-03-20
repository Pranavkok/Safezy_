'use client';
'use memo';

import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { getContractorOrdersColumns } from './ContractorOrdersColumn';
import { useRouter } from 'next/navigation';
import {} from '@/actions/admin/order';
import { useMemo } from 'react';
import { AdminContractorOrdersTableColumnType } from '@/types/contractor.types';

type ContractorOrdersPropsType = {
  contractorOrders: {
    success: boolean;
    message: string;
    data?: AdminContractorOrdersTableColumnType[];
    pageCount?: number;
  };
};

export function ContractorOrdersTable({
  contractorOrders
}: ContractorOrdersPropsType) {
  const { data = [], pageCount = 1 } = contractorOrders;

  const router = useRouter();

  const columns = useMemo(() => getContractorOrdersColumns(router), [router]);

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    initialState: {
      columnPinning: { right: ['actions'] }
    },
    getRowId: (originalRow, index) => `${originalRow.id}-${index}`
  });

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
