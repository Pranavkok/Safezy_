'use client';

import * as React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { StaffMember } from '@/actions/admin/staff';
import ToggleStaffStatusSection from './ToggleStaffStatusSection';
import EditStaffDialog from './EditStaffDialog';

export function getStaffListingColumns(): ColumnDef<StaffMember>[] {
  return [
    {
      accessorKey: 'first_name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
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
      accessorKey: 'contact_number',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Contact" />
      ),
      cell: ({ row }) => <span>{row.getValue('contact_number')}</span>,
      enableSorting: false
    },
    {
      accessorKey: 'role',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
      cell: ({ row }) => {
        const role = row.getValue('role') as string;
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              role === 'manager'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-purple-100 text-purple-800'
            }`}
          >
            {role === 'manager' ? 'Manager' : 'Safety Officer'}
          </span>
        );
      },
      enableSorting: false
    },
    {
      accessorKey: 'is_active',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <ToggleStaffStatusSection
          id={String(row.original.id)}
          isActive={row.original.is_active}
        />
      ),
      enableSorting: false,
      enableHiding: false
    },
    {
      id: 'actions',
      header: () => <span>Actions</span>,
      cell: ({ row }) => <EditStaffDialog staff={row.original} />,
      enableSorting: false,
      enableHiding: false
    }
  ];
}
