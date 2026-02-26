'use client';
'use memo';

import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { useRouter } from 'next/navigation';
import { FirstPrinciplesType } from '@/types/index.types';
import { DataTableFilterField } from '@/types/data-table.types';
import { Plus } from 'lucide-react';
import { AppRoutes } from '@/constants/AppRoutes';
import { Button } from '@/components/ui/button';
import { getFirstPrincipleListingColumns } from './PrinciplesListingColumn';
import { useMemo } from 'react';
import FirstPrincipleSugggestionModal from '@/components/modals/ehs/FirstPrincipleSuggestionModal';

interface FirstPrincipleListingProps {
  firstPrinciples: {
    success: boolean;
    message: string;
    data?: FirstPrinciplesType[];
    pageCount?: number;
    count?: number;
  };
}

export function PrincipleListingTable({
  firstPrinciples
}: FirstPrincipleListingProps) {
  const { data = [], pageCount = 1 } = firstPrinciples;

  const router = useRouter();

  const columns = useMemo(
    () => getFirstPrincipleListingColumns(router),
    [router]
  );

  const filterFields: DataTableFilterField<FirstPrinciplesType>[] = [
    {
      label: 'Title',
      value: 'title',
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
        <FirstPrincipleSugggestionModal />
        <Button
          onClick={() => router.push(AppRoutes.ADMIN_EHS_FIRST_PRINCIPLES_ADD)}
        >
          <Plus className=" w-5 h-5 sm:mr-2" />
          <span className=" hidden sm:block">Add New Principle</span>
        </Button>
      </DataTableToolbar>
    </DataTable>
  );
}
