'use client';

import * as React from 'react';
import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { DataTableFilterField } from '@/types/data-table.types';
import { getStaffListingColumns } from './StaffListingColumn';
import { StaffMember } from '@/actions/admin/staff';
import Link from 'next/link';
import { AppRoutes } from '@/constants/AppRoutes';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface Props {
  staff: {
    success: boolean;
    message: string;
    data?: StaffMember[];
  };
}

export function StaffListingTable({ staff }: Props) {
  const { data = [] } = staff;

  const columns = React.useMemo(() => getStaffListingColumns(), []);

  const filterFields: DataTableFilterField<StaffMember>[] = [
    {
      label: 'Name',
      value: 'first_name',
      placeholder: 'Filter by name...'
    }
  ];

  const { table } = useDataTable({
    data,
    columns,
    pageCount: 1,
    filterFields,
    initialState: {
      columnPinning: { right: ['is_active'] }
    },
    getRowId: (originalRow, index) => `${originalRow.id}-${index}`
  });

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} filterFields={filterFields}>
        <Link href={AppRoutes.ADMIN_STAFF_ADD}>
          <Button size="sm" className="h-8 gap-1">
            <Plus size={16} />
            Add Staff
          </Button>
        </Link>
      </DataTableToolbar>
    </DataTable>
  );
}
