'use client';

import * as React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { useRouter } from 'next/navigation';
import EyeIcon from '@/components/svgs/EyeIcon';
import { AppRoutes } from '@/constants/AppRoutes';
import { OrderListingContractorType } from '@/types/order.types';
import { formattedDate } from '@/lib';

export function getOrderListingsColumns(
  router: ReturnType<typeof useRouter>
): ColumnDef<OrderListingContractorType>[] {
  return [
    {
      accessorKey: 'date',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Order Created Date" />
      ),
      cell: ({ row }) => <span>{formattedDate(row.getValue('date'))}</span>
    },
    {
      accessorKey: 'total_amount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
      cell: ({ row }) => <span>{row.getValue('total_amount')}</span>
    },
    {
      accessorKey: 'total_quantity',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Quantity" />
      ),
      cell: ({ row }) => <span>{row.getValue('total_quantity')}</span>
    },
    {
      accessorKey: 'order_status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Order Status" />
      ),
      cell: ({ row }) => <span>{row.getValue('order_status')}</span>,
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
          <div className="flex gap-1 ">
            <div
              className="hover:bg-transparent px-1"
              onClick={() =>
                router.push(
                  AppRoutes.PRINCIPAL_EMPLOYER_ORDER_DETAILS(row.original.id)
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
