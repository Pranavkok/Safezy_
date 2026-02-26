'use client';

import React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { AppRoutes } from '@/constants/AppRoutes';
import EyeIcon from '@/components/svgs/EyeIcon';
import { useRouter } from 'next/navigation';
import { FetchContractorType } from '@/actions/admin/contractor';

export function getContractorsListingsColumns(
  router: ReturnType<typeof useRouter>
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
      accessorKey: 'total_orders',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total Orders" />
      ),
      cell: ({ row }) => <span>{row.getValue('total_orders')}</span>
    },
    {
      accessorKey: 'total_amount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total Value of Orders" />
      )
    },
    {
      accessorKey: 'is_active',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Active Status" />
      ),
      cell: ({ row }) => {
        const isActive = row.getValue('is_active');
        return (
          <button
            className={`px-3 py-1 flex justify-center items-center rounded-full text-xs font-semibold cursor-pointer shadow ${
              isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {isActive ? 'Active' : 'Inactive'}
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
      cell: function Cell({ row }) {
        return (
          <div className="flex  ">
            <div
              className="hover:bg-transparent"
              onClick={() =>
                router.push(
                  AppRoutes.ADMIN_CONTRACTOR_DETAILS(row.getValue('id'))
                )
              }
            >
              <EyeIcon className="fill-gray-400 hover:fill-primary w-5 h-5 transition-colors duration-300 " />
            </div>
          </div>
        );
      },
      size: 40,
      enableSorting: false,
      enableHiding: false
    }
  ];
}
