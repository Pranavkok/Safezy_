'use client';
'use memo';

import * as React from 'react';
import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { DataTableFilterField } from '@/types/data-table.types';
import { getWarehouseListingsColumns } from './WarehouseListingColumn';
import { WarehouseWithAddressType } from '@/actions/warehouse-operator/warehouse';
import AddNewWarehouseModal from '@/components/modals/AddNewWarehouseModal';

export interface WarehouseListingTablePropsType {
  warehouses: {
    success: boolean;
    message: string;
    data?: WarehouseWithAddressType[];
    pageCount?: number;
  };
}

export function WarehouseListingTable({
  warehouses
}: WarehouseListingTablePropsType) {
  const { data = [], pageCount = 1 } = warehouses;

  const columns = React.useMemo(() => getWarehouseListingsColumns(), []);

  const filterFields: DataTableFilterField<WarehouseWithAddressType>[] = [
    {
      label: 'Store Name',
      value: 'first_name',
      placeholder: 'Filter store names...'
    }
  ];

  // DataTable hook with configuration
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
        <AddNewWarehouseModal />
      </DataTableToolbar>
    </DataTable>
  );
}
