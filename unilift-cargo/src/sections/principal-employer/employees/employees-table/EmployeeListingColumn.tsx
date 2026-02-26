'use client';

import React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { EmployeeType } from '@/types/index.types';
import EmployeeHistoryModal from '@/components/modals/EmployeeHistoryModal';

export function getEmployeeListingColumns(): ColumnDef<EmployeeType>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Employee Name" />
      ),
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'assigned_equipments',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Assigned Equipments" />
      ),
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'contact_number',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Employee Phone Number" />
      ),
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'designation',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Employee Designation" />
      ),
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Action" />
      ),
      cell: async ({ row }) => {
        return (
          <div className="flex gap-1">
            <EmployeeHistoryModal employeeId={row.original.id} />
          </div>
        );
      },
      size: 40,
      enableSorting: false,
      enableHiding: false
    }
  ];
}
