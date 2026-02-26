'use client';
'use memo';

import * as React from 'react';
import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { DataTableFilterField } from '@/types/data-table.types';
import { fetchOrderedProductDetails } from '@/actions/contractor/inventory';
import { OrderedProductDetailsType } from '@/types/inventory.types';
import { getEquipmentListingColumns } from './EquipmenDetailsColumn';

interface EquipmentListingTableProps {
  equipmentListingPromise: ReturnType<typeof fetchOrderedProductDetails>;
}

export function EquipmentListingTable({
  equipmentListingPromise
}: EquipmentListingTableProps) {
  const { data = [], pageCount = 1 } = React.use(equipmentListingPromise);

  const columns = React.useMemo(() => getEquipmentListingColumns(), []);

  const filterFields: DataTableFilterField<
    Partial<OrderedProductDetailsType>
  >[] = [
    {
      label: 'Employee Name',
      value: 'employeeName',
      placeholder: 'Search Employee...'
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
