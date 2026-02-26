'use client';
'use memo';

import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { useRouter } from 'next/navigation';
import { getToolboxTalkListingColumns } from './ToolboxTalkListingColumn';
import { ToolboxTalkType } from '@/types/index.types';
import { DataTableFilterField } from '@/types/data-table.types';
import { Plus } from 'lucide-react';
import { AppRoutes } from '@/constants/AppRoutes';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';
import ToolboxTalkSugggestionModal from '@/components/modals/ehs/ToolboxTalkSuggestionsModal';

interface ToolboxTalkListingProps {
  toolboxTalks: {
    success: boolean;
    message: string;
    data?: ToolboxTalkType[];
    pageCount?: number;
    count?: number;
  };
}

export function ToolboxTalkListingTable({
  toolboxTalks
}: ToolboxTalkListingProps) {
  const { data = [], pageCount = 1 } = toolboxTalks;

  const router = useRouter();

  const columns = useMemo(() => getToolboxTalkListingColumns(router), [router]);

  const filterFields: DataTableFilterField<ToolboxTalkType>[] = [
    {
      label: 'Topic Name',
      value: 'topic_name',
      placeholder: 'Filter titles...'
    }
  ];

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    filterFields,
    initialState: {
      columnPinning: { right: ['actions'] }
    },
    getRowId: (originalRow, index) => `${originalRow.id}-${index}`
  });

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} filterFields={filterFields}>
        <ToolboxTalkSugggestionModal />
        <Button
          onClick={() => router.push(AppRoutes.ADMIN_EHS_TOOLBOX_TALK_ADD)}
        >
          <Plus className=" w-5 h-5 sm:mr-2" />
          <span className="">Add New Talk</span>
        </Button>
      </DataTableToolbar>
    </DataTable>
  );
}
