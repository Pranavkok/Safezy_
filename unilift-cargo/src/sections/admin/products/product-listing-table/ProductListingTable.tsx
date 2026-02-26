'use client';
'use memo';

import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { DataTableFilterField } from '@/types/data-table.types';
import { getProductColumns } from './ProductListingColumn';
import { useRouter } from 'next/navigation';
import { SortedProductDataType } from '@/types/product.types';
import { useMemo } from 'react';
import Link from 'next/link';
import { AppRoutes } from '@/constants/AppRoutes';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ProductsTablePropsType {
  products: {
    data?: SortedProductDataType[];
    success: boolean;
    message: string;
    pageCount?: number;
  };
}
export function ProductsTable({ products }: ProductsTablePropsType) {
  const { data = [], pageCount = 1 } = products;

  const router = useRouter();

  const columns = useMemo(() => getProductColumns(router), [router]);

  const filterFields: DataTableFilterField<SortedProductDataType>[] = [
    {
      label: 'Customer Name',
      value: 'ppe_name',
      placeholder: 'Filter titles...'
    },
    {
      label: 'Filter',
      value: 'ppe_category',
      options: [
        { value: 'head_protection', label: 'Head Protection' },
        { value: 'respiratory_protection', label: 'Respiratory Protection' },
        { value: 'face_protection', label: 'Face Protection' },
        { value: 'eye_protection', label: 'Eye Protection' },
        { value: 'hand_protection', label: 'Hand Protection' },
        { value: 'leg_protection', label: 'Foot Protection' },
        { value: 'fall_protection', label: 'Fall Protection' }
      ]
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
        <Link href={AppRoutes.ADMIN_ADD_PRODUCT}>
          <Button>
            <Plus className=" w-5 h-5 sm:mr-2" />
            <span className="hidden sm:block">Add New Product</span>
          </Button>
        </Link>
      </DataTableToolbar>
    </DataTable>
  );
}
