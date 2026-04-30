'use client';

import React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { FetchContractorType } from '@/actions/admin/contractor';

export function getPpeAssignmentsColumns(
  onAssign: (contractor: FetchContractorType) => void
): ColumnDef<FetchContractorType>[] {
  return [
    {
      accessorKey: 'first_name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Customer Name" />
      ),
      cell: ({ row }) => (
        <span>
          {row.getValue('first_name')} {row.original.last_name}
        </span>
      )
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => <span>{row.getValue('email')}</span>
    },
    {
      accessorKey: 'contact_number',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Contact" />
      ),
      cell: ({ row }) => <span>{row.getValue('contact_number')}</span>,
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Action" />
      ),
      cell: function Cell({ row }) {
        return (
          <Button
            size="sm"
            className="h-8 text-xs"
            onClick={() => onAssign(row.original)}
          >
            Assign PPE
          </Button>
        );
      },
      size: 120,
      enableSorting: false,
      enableHiding: false
    }
  ];
}
