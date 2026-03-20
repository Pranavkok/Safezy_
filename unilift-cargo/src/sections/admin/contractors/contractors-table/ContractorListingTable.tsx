'use client';
'use memo';

import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { DataTableFilterField } from '@/types/data-table.types';
import { getContractorsListingsColumns } from './ContractorListingColumn';
import { useRouter } from 'next/navigation';
import { FetchContractorType } from '@/actions/admin/contractor';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { handleDownload } from '@/utils/downloadExcel';
import Spinner from '@/components/loaders/Spinner';
import { DownloadIcon } from '@radix-ui/react-icons';

type ContractorListingPropsType = {
  contractors: {
    success: boolean;
    message: string;
    data?: FetchContractorType[];
    pageCount?: number;
  };
};

export function ContractorListingTable({
  contractors
}: ContractorListingPropsType) {
  const { data = [], pageCount = 1 } = contractors;
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const columns = useMemo(
    () => getContractorsListingsColumns(router),
    [router]
  );

  const filterFields: DataTableFilterField<FetchContractorType>[] = [
    {
      label: 'Customer Name',
      value: 'first_name',
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

  const handleExport = async () => {
    setLoading(true);
    await handleDownload();
    setLoading(false);
  };

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} filterFields={filterFields}>
        <Button onClick={handleExport} disabled={loading}>
          {loading ? (
            <>
              <Spinner className="mb-1" />
              <span className="hidden sm:block">Exporting...</span>
            </>
          ) : (
            <>
              <DownloadIcon className="sm:mr-2" />
              <span className="hidden sm:block">Export To Excel</span>
            </>
          )}
        </Button>
      </DataTableToolbar>
    </DataTable>
  );
}
