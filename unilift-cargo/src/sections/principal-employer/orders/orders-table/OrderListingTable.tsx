'use client';
'use memo';

import * as React from 'react';
import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { getOrderListingsColumns } from './OrderListingColumn';
import { DataTableFilterField } from '@/types/data-table.types';
import { useRouter } from 'next/navigation';
import { OrderListingContractorType, OrderStatus } from '@/types/order.types';

type OrderListingTablePropType = {
  orderListing: {
    success: boolean;
    message: string;
    data?: OrderListingContractorType[];
    pageCount?: number;
  };
};

export function OrderListingTable({ orderListing }: OrderListingTablePropType) {
  const { data = [], pageCount = 1 } = orderListing;

  const router = useRouter();

  const columns = React.useMemo(
    () => getOrderListingsColumns(router),
    [router]
  );

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
