'use client';

import React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { EmployeeType, EmployeeWithWorksiteType } from '@/types/index.types';
import ConfirmDeleteEmployee from '../ConfirmDeleteEmployee';
import UpdateEmployeeModal from '@/components/modals/UpdateEmployeeModal';
import EmployeeHistoryModal from '@/components/modals/EmployeeHistoryModal';
import PPEManagementModal from '@/components/modals/PPEManagementModal';

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
      accessorKey: 'department',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Department" />
      ),
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'plant',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Plant" />
      ),
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Assign" />
      ),
      cell: ({ row }) => {
        const employeeDetails = row.original;
        return <PPEManagementModal employeeId={employeeDetails.id} />;
      },
      size: 40,
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'action',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Action" />
      ),
      cell: function Cell({ row }) {
        const employeeDetails = row.original;

        return (
          <div className="flex gap-2">
            <UpdateEmployeeModal
              employeeDetails={employeeDetails as EmployeeWithWorksiteType}
            />
            <EmployeeHistoryModal employeeId={row.original.id} />
            <ConfirmDeleteEmployee id={row.original.id} />
          </div>
        );
      },
      size: 40,
      enableSorting: false,
      enableHiding: false
    }
  ];
}
