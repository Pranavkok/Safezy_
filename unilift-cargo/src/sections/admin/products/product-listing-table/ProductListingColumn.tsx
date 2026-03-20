'use client';

import * as React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import EditIcon from '@/components/svgs/EditIcon';
import { useRouter } from 'next/navigation';
import { AppRoutes } from '@/constants/AppRoutes';
import { PRODUCT_CATEGORIES } from '@/constants/product';
import ConfirmDeleteProduct from '../ConfirmDeleteProduct';
import Image from 'next/image';
import { SortedProductDataType } from '@/types/product.types';
import { getProductBrandLabel } from '@/utils';

export function getProductColumns(
  router: ReturnType<typeof useRouter>
): ColumnDef<SortedProductDataType>[] {
  return [
    {
      accessorKey: 'image',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Image" />
      ),
      cell: ({ row }) => (
        <div className="w-10 h-10 rounded-full border border-primary overflow-hidden">
          <Image
            className="object-cover h-full w-full"
            height={400}
            width={400}
            src={row.original.image || ''}
            alt={row.getValue('ppe_name')}
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'product_ID',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Product Id" />
      ),
      cell: ({ row }) => <p>{row.getValue('product_ID')}</p>,
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'ppe_name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Product Name" />
      )
    },
    {
      accessorKey: 'brand_name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Brand Name" />
      ),
      cell: ({ row }) => (
        <p>{getProductBrandLabel(row.original.brand_name ?? '')}</p>
      )
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
      cell: ({ row }) => <span>{row.getValue('price')}</span>
    },
    {
      accessorKey: 'total_orders',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total Orders" />
      )
    },
    {
      accessorKey: 'order_frequency',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Monthly Order Frequency"
        />
      )
    },
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Action" />
      ),

      cell: ({ row }) => {
        return (
          <div className="flex gap-3">
            <button
              className="hover:bg-transparent"
              onClick={() =>
                router.push(AppRoutes.ADMIN_UPDATE_PRODUCT(row.getValue('id')))
              }
            >
              <EditIcon className="fill-gray-400 hover:fill-primary w-4 h-4 transition-colors duration-300 " />
            </button>

            <ConfirmDeleteProduct
              productName={row.original.ppe_name}
              id={row.original.id}
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
