'use client';
'use memo';

import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { useRouter } from 'next/navigation';
import { getToolboxTalkListingColumns } from './ToolboxTalkListingColumn';
import { ToolboxTalkType } from '@/types/index.types';
import { DataTableFilterField } from '@/types/data-table.types';
import { Download, Plus } from 'lucide-react';
import { AppRoutes } from '@/constants/AppRoutes';
import { Button } from '@/components/ui/button';
import { useMemo, useState } from 'react';
import ToolboxTalkSugggestionModal from '@/components/modals/ehs/ToolboxTalkSuggestionsModal';
import {
  getToolboxTalkReportEntries,
  ToolboxTalkReportEntry
} from '@/actions/admin/ehs/toolbox-talk';

type PeriodFilter = 'this_week' | 'this_month' | 'last_3_months';

const PERIOD_LABELS: Record<PeriodFilter, string> = {
  this_week: 'This Week',
  this_month: 'This Month',
  last_3_months: 'Last 3 Months'
};

function filterByPeriod(
  reportRows: ToolboxTalkReportEntry[],
  period: PeriodFilter
): ToolboxTalkReportEntry[] {
  const now = new Date();
  const start = new Date();

  if (period === 'this_week') {
    const day = now.getDay();
    start.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    start.setHours(0, 0, 0, 0);
  } else if (period === 'this_month') {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
  } else {
    start.setMonth(now.getMonth() - 3);
    start.setHours(0, 0, 0, 0);
  }

  return reportRows.filter(row => new Date(row.date) >= start);
}

async function downloadExcel(
  reportRows: ToolboxTalkReportEntry[],
  period: PeriodFilter
) {
  const ExcelJS = (await import('exceljs')).default;
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Toolbox Talks');

  ws.columns = [
    { header: 'Sr No.', key: 'sr_no', width: 10 },
    { header: 'Topic', key: 'topic', width: 35 },
    { header: 'Date', key: 'date', width: 18 },
    { header: 'Rating', key: 'rating', width: 14 },
    { header: 'Submitted By', key: 'submitted_by', width: 28 }
  ];

  const headerRow = ws.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE07B39' } };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 20;

  const filtered = filterByPeriod(reportRows, period);
  filtered.forEach((rowData, idx) => {
    const row = ws.addRow({
      sr_no: idx + 1,
      topic: rowData.topic,
      date: new Date(rowData.date).toLocaleDateString('en-IN'),
      rating:
        rowData.rating != null && !Number.isNaN(rowData.rating)
          ? rowData.rating.toFixed(1)
          : '—',
      submitted_by: rowData.submittedBy
    });

    row.alignment = { vertical: 'middle' };
    if (idx % 2 === 1) {
      row.eachCell({ includeEmpty: true }, cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
      });
    }
  });

  ws.addRow([]);
  const summaryRow = ws.addRow([`Total: ${filtered.length} submissions`]);
  summaryRow.font = { bold: true, italic: true, color: { argb: 'FF6B7280' } };

  ws.eachRow({ includeEmpty: false }, row => {
    row.eachCell({ includeEmpty: true }, cell => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
      };
    });
  });

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `toolbox-talks-${period}-${new Date().toISOString().split('T')[0]}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

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
  const [period, setPeriod] = useState<PeriodFilter>('this_month');
  const [downloading, setDownloading] = useState(false);

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

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const reportRes = await getToolboxTalkReportEntries();
      await downloadExcel(reportRes.data ?? [], period);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} filterFields={filterFields}>
        <ToolboxTalkSugggestionModal />

        {/* Download Report */}
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={e => setPeriod(e.target.value as PeriodFilter)}
            className="text-xs border border-gray-300 rounded-md px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {(Object.entries(PERIOD_LABELS) as [PeriodFilter, string][]).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-md hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            {downloading ? 'Downloading...' : 'Download Report'}
          </button>
        </div>

        <Button
          size="sm"
          onClick={() => router.push(AppRoutes.ADMIN_EHS_TOOLBOX_TALK_ADD)}
        >
          <Plus className="w-4 h-4 sm:mr-1" />
          <span className="hidden sm:inline">Add New Talk</span>
        </Button>
      </DataTableToolbar>
    </DataTable>
  );
}
