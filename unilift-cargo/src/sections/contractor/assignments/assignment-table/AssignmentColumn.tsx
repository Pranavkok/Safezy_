'use client';

import * as React from 'react';
import { Column, Row, type ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { EmployeePPEHistoryType } from '@/types/employee.types';
import EmployeeHistoryModal from '@/components/modals/EmployeeHistoryModal';
import { formattedDate } from '@/lib';

export function getAssignmentColumns(
  products: string[]
): ColumnDef<EmployeePPEHistoryType>[] {
  const productColumns = products.map(product => ({
    accessorKey: product,
    header: ({
      column
    }: {
      column: Column<EmployeePPEHistoryType, unknown>;
    }) => (
      <DataTableColumnHeader
        column={column}
        title={product}
        className="font-light flex whitespace-nowrap items-center justify-center"
      />
    ),
    cell: ({ row }: { row: Row<EmployeePPEHistoryType> }) => {
      const statusDetails = row.original.status?.[product];
      const isAssigned = statusDetails?.state === 'Assigned';

      return (
        <div className="w-full flex justify-center">
          {isAssigned && statusDetails?.date ? (
            <span className="px-2 py-1 flex justify-center items-center rounded-full text-xs font-semibold shadow w-28 bg-green-100 text-green-800">
              {formattedDate(statusDetails.date)}
            </span>
          ) : (
            <div
              className={`px-2 py-1 flex justify-center items-center rounded-full text-xs font-semibold shadow w-28 bg-red-100 text-red-800`}
            >
              Not Assigned
            </div>
          )}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false
  }));

  return [
    {
      accessorKey: 'employeeName',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Employee Name"
          className="font-bold whitespace-nowrap"
        />
      ),
      cell: ({ row }) => (
        <span className="font-extrabold whitespace-nowrap">
          {row.original.employeeName}
        </span>
      ),
      enableSorting: false,
      enableHiding: false
    },
    ...productColumns,

    {
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Action" />
      ),
      cell: async ({ row }) => {
        return (
          <div className="flex gap-1">
            <EmployeeHistoryModal
              employeeId={row.original.employeeId as number}
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
