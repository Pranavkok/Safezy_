'use client';

import React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { useRouter } from 'next/navigation';
import { ToolboxTalkType } from '@/types/index.types';
import { EditIcon } from '@/components/svgs';
import { AppRoutes } from '@/constants/AppRoutes';
import ConfirmDeleteToolboxTalk from '../ConfirmDeleteToolboxTalkSection';
import ToolboxTalkUserDetailsModal from '@/components/modals/ehs/ToolboxTalkUserDetailsModal';

export function getToolboxTalkListingColumns(
  router: ReturnType<typeof useRouter>
): ColumnDef<ToolboxTalkType>[] {
  return [
    {
      accessorKey: 'topic_name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Topic Name" />
      ),
      cell: ({ row }) => <span>{row.getValue('topic_name')}</span>,
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Action " />
      ),
      cell: function Cell({ row }) {
        return (
          <div className="flex items-center gap-3">
            <div
              className="hover:bg-transparen"
              onClick={() =>
                router.push(
                  AppRoutes.ADMIN_EHS_TOOLBOX_TALK_UPDATE(row.original.id)
                )
              }
            >
              <EditIcon className="fill-gray-400 hover:fill-primary w-4 h-4 transition-colors duration-300 " />
            </div>
            <ToolboxTalkUserDetailsModal
              toolboxTalkId={row.original.id}
              topicName={row.original.topic_name}
            />

            <ConfirmDeleteToolboxTalk
              topicName={row.original.topic_name}
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
