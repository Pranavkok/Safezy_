'use client';

import React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { OrderedProductDetailsType } from '@/types/inventory.types';
import EquipmentDetailsModal from '@/components/modals/EquipmentDetailsModal';

export function getEquipmentListingColumns(): ColumnDef<
  Partial<OrderedProductDetailsType>
>[] {
  return [
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Equipment ID" />
      ),
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'employeeName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Updated Employee Name" />
      ),
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'assignedDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Assigned Date" />
      ),
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'expirationDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Expiration Date" />
      ),
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Active Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <button
            className={`px-3 py-1 flex justify-center items-center rounded-full text-xs font-semibold cursor-pointer shadow bg-white text-gray-400 border border-gray-300`}
          >
            {status}
          </button>
        );
      },
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Action" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex gap-1">
            <EquipmentDetailsModal equipmentId={row.original.id as number} />
          </div>
        );
      },
      size: 40,
      enableSorting: false,
      enableHiding: false
    }
  ];
}
