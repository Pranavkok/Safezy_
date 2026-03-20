'use client';
'use memo';

import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { getOrderDetailsColumns } from './OrderDetailsColumn';
import { useMemo } from 'react';
import { OrderItemsListingType } from '@/types/order.types';
export interface OrderDetailsTablePropsType {
  orderItems: {
    success: boolean;
    message: string;
    data?: OrderItemsListingType[];
    pageCount?: number;
  };
}

export function OrderDetailsTable({ orderItems }: OrderDetailsTablePropsType) {
  const { data = [], pageCount = 1 } = orderItems;

  const columns = useMemo(() => getOrderDetailsColumns(), []);

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
