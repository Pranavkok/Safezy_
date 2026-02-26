'use client';

import * as React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import ComplaintsModal from '@/components/modals/ComplaintsModal';
import { ComplaintListingType } from '@/types/complaint.types';

export function getComplaintsColumns(): ColumnDef<ComplaintListingType>[] {
  return [
    {
      accessorKey: 'first_name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Customer Name" />
      ),
      cell: ({ row }) => (
        <span>
          {row.original.first_name} {row.original.last_name}
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
      accessorKey: 'company_name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Company Name" />
      ),
      cell: ({ row }) => <span>{row.getValue('company_name')}</span>
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
      id: 'actions',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Action" />
      ),
      cell: function Cell({ row }) {
        return (
          <div className="flex gap-3 ">
            <ComplaintsModal
              description={row.original.description}
              name={row.original.first_name + ' ' + row.original.last_name}
              email={row.original.email}
              imageUrl={row.original.image}
              contact={row.original.contact_number}
              order_id={row.original.order_id as string}
            />
          </div>
        );
      },
      size: 40,
      enableSorting: false,
      enableHiding: false
    }
  ];
}
