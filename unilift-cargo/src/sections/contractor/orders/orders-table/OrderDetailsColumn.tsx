'use client';

import * as React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import Image from 'next/image';
import { OrderItemsListingType } from '@/types/order.types';
import { PRODUCT_CATEGORIES } from '@/constants/product';
import { getProductBrandLabel } from '@/utils';

export function getOrderDetailsColumns(): ColumnDef<OrderItemsListingType>[] {
  return [
    {
      accessorKey: 'ppe_name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Order Item" />
      ),
      cell: ({ row }) => (
        <div className="flex gap-2 items-center ">
          <div className="w-20 h-12 rounded-full border border-primary overflow-hidden">
            <Image
              className="object-cover h-full w-full"
              height={400}
              width={400}
              src={row.original.image ?? ''}
              alt={row.getValue('ppe_name')}
            />
          </div>
          <p>{row.getValue('ppe_name')}</p>
        </div>
      ),
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'brand_name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Brand Name" />
      ),
      cell: ({ row }) => (
        <p>{getProductBrandLabel(row.original.brand_name ?? '')}</p>
      ),
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'size',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Size" />
      ),
      cell: ({ row }) => {
        return <p>{row.getValue('size')}</p>;
      },
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'color',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Color" />
      ),
      cell: ({ row }) => {
        return (
          <div
            className={`w-6 h-6 rounded-full`}
            style={{ backgroundColor: row.original.color }}
          ></div>
        );
      },
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'ppe_category',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Categories" />
      ),
      cell: ({ row }) => (
        <span>
          {
            PRODUCT_CATEGORIES.find(
              category => category.value === row.getValue('ppe_category')
            )?.label
          }
        </span>
      ),
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'price',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Price" />
      ),
      cell: ({ row }) => <span>{row.getValue('price')}</span>,
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'quantity',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Quantity" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center">
            <span className="capitalize">{row.getValue('quantity')}</span>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'total_price',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total Price" />
      ),
      cell: ({ row }) => <span>{row.getValue('total_price')}</span>,
      enableSorting: false,
      enableHiding: false
    }
  ];
}
