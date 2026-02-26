'use client';

import * as React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { WorksiteWithAddressType } from '@/types/index.types';
// import ConfirmDeleteWorskite from "../ConfirmDeleteWorksite";
import UpdateWorksiteModal from '@/components/modals/contractor/worksite/UpdateWorksiteModal';

export function getWorksitesListingColumns(): ColumnDef<WorksiteWithAddressType>[] {
  return [
    {
      accessorKey: 'unique_code',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Unique Code" />
      ),
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'site_name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Worksite" />
      ),
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'site_manager',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Site In-Charge" />
      ),
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'contact_number',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Contact Number" />
      ),
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Action" />
      ),
      cell: ({ row }) => {
        const worksiteDetails = row.original;

        return (
          <div className="flex">
            <UpdateWorksiteModal worksiteDetails={worksiteDetails} />
            {/* <ConfirmDeleteWorskite id={row.original.id} /> */}
          </div>
        );
      },
      size: 40,
      enableSorting: false,
      enableHiding: false
    }
  ];
}
