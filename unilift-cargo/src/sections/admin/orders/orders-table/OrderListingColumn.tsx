'use client';

import * as React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { useRouter } from 'next/navigation';
import EyeIcon from '@/components/svgs/EyeIcon';
import DownloadIcon from '@/components/svgs/DownloadIcon';
import { OrderListingType } from '@/types/order.types';
import { AppRoutes } from '@/constants/AppRoutes';
import { formattedDate } from '@/lib';
import Link from 'next/link';

export function getOrderListingsColumns(
  router: ReturnType<typeof useRouter>
): ColumnDef<OrderListingType>[] {
  return [
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Order Number" />
      ),
      cell: ({ row }) => <div>{row.original.id}</div>,
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'first_name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Customer Name" />
      ),
      cell: ({ row }) => (
        <div>
          <p>
            {row.original.first_name} {row.original.last_name}
          </p>
          <p>{row.original.email}</p>
        </div>
      ),
      enableSorting: false,
      enableHiding: false
    },
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
      accessorKey: 'warehouse',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Assigned Warehouse" />
      ),
      cell: ({ row }) => {
        const warehouse = row.getValue('warehouse');
        return warehouse ? <p>{`${warehouse}`}</p> : <p> - </p>;
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
          <div className="flex gap-2">
            <Link
              className="hover:bg-transparent px-1 mt-[2px]"
              href={AppRoutes.CONTRACTOR_INVOICE_DOWNLOAD(row.original.id)}
              target="_blank"
            >
              <DownloadIcon className="fill-gray-400 hover:stroke-primary w-4 h-4 transition-colors duration-300 stroke-gray-400 stroke-1 " />
            </Link>
            <div
              className="hover:bg-transparent px-1"
              onClick={() =>
                router.push(AppRoutes.ADMIN_ORDER_DETAILS(row.original.id))
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
