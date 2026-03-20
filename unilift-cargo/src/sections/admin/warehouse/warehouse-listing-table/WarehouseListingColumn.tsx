'use client';

import * as React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { WarehouseWithAddressType } from '@/actions/warehouse-operator/warehouse';
import ConfirmActiveInactiveSection from '../../contractors/ConfirmActiveInactiveSection';
import { USER_ROLES } from '@/constants/constants';

export function getWarehouseListingsColumns(): ColumnDef<WarehouseWithAddressType>[] {
  return [
    {
      accessorKey: 'first_name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Store Name" />
      ),
      cell: ({ row }) => <span>{row.getValue('first_name')}</span>
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Store Email" />
      ),
      cell: ({ row }) => <span>{row.getValue('email')}</span>
    },
    {
      accessorKey: 'contact_number',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Store Contact" />
      ),
      cell: ({ row }) => <span>{row.getValue('contact_number')}</span>,
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'address',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Store Address" />
      ),
      cell: ({ row }) => <span>{row.getValue('address')}</span>,
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <ConfirmActiveInactiveSection
          id={row.original.id}
          isActive={row.original.is_active}
          userRole={USER_ROLES.WAREHOUSE_OPERATOR}
        />
      ),

      size: 40,
      enableSorting: false,
      enableHiding: false
    }
  ];
}
