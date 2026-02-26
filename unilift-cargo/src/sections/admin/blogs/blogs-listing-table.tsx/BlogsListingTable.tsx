'use client';
'use memo';

import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { useRouter } from 'next/navigation';
import { BlogType } from '@/types/index.types';
import { DataTableFilterField } from '@/types/data-table.types';
import { Plus } from 'lucide-react';
import { AppRoutes } from '@/constants/AppRoutes';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';
import { getBlogsListingColumns } from './BlogsListingColumn';

interface BlogsListingProps {
  blogs: {
    success: boolean;
    message: string;
    data?: BlogType[];
    pageCount?: number;
    count?: number;
  };
}

export function BlogsListingTable({ blogs }: BlogsListingProps) {
  const { data = [], pageCount = 1 } = blogs;

  const router = useRouter();

  const columns = useMemo(() => getBlogsListingColumns(router), [router]);

  const filterFields: DataTableFilterField<BlogType>[] = [
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
        <Button onClick={() => router.push(AppRoutes.ADMIN_ADD_BLOG)}>
          <Plus className=" w-5 h-5 sm:mr-2" />
          <span className="">Add New Blog</span>
        </Button>
      </DataTableToolbar>
    </DataTable>
  );
}
