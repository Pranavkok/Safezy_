'use client';

import React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { useRouter } from 'next/navigation';
import { BlogType } from '@/types/index.types';
import { EditIcon } from '@/components/svgs';
import { AppRoutes } from '@/constants/AppRoutes';
import { ConfirmDeleteBlog } from '../ConfirmDeleteBlogSection';

export function getBlogsListingColumns(
  router: ReturnType<typeof useRouter>
): ColumnDef<BlogType>[] {
  return [
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row }) => <span>{row.getValue('title')}</span>,
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'description',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => <span>{row.getValue('description')}</span>,
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
          <div className="flex items-center gap-3">
            <div
              className="hover:bg-transparent"
              onClick={() =>
                router.push(AppRoutes.ADMIN_UPDATE_BLOG(row.original.id))
              }
            >
              <EditIcon className="fill-gray-400 hover:fill-primary w-4 h-4 transition-colors duration-300 " />
            </div>

            <ConfirmDeleteBlog
              blogTitle={row.original.title}
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
