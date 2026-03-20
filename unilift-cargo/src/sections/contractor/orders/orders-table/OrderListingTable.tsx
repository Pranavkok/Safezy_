'use client';
'use memo';

import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { getOrderListingsColumns } from './OrderListingColumn';
import { DataTableFilterField } from '@/types/data-table.types';
import { useRouter } from 'next/navigation';
import { OrderListingContractorType, OrderStatus } from '@/types/order.types';
import { useMemo } from 'react';

type OrderListingTablePropType = {
  orders: { data?: OrderListingContractorType[]; pageCount?: number };
};

export function OrderListingTable({ orders }: OrderListingTablePropType) {
  const { data = [], pageCount = 1 } = orders;

  const router = useRouter();

  const columns = useMemo(() => getOrderListingsColumns(router), [router]);

  const filterFields: DataTableFilterField<OrderListingContractorType>[] = [
    {
      label: 'Filter',
      value: 'order_status',
      options: Object.values(OrderStatus).map(status => ({
        column_name: 'order_status',
        label: `Order ${status[0]?.toUpperCase() + status.slice(1)}`,
        value: status,
        withCount: true
      }))
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
