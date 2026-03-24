'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UaUcNearMissRecord, ObservationType, ObservationStatus } from '@/types/ehs.types';
import { formatDate } from '@/utils/date';
import { Download } from 'lucide-react';

const TYPE_LABELS: Record<string, string> = {
  UA: 'Unsafe Act',
  UC: 'Unsafe Condition',
  NearMiss: 'Near Miss'
};

const TYPE_COLORS: Record<string, string> = {
  UA: 'bg-orange-100 text-orange-800',
  UC: 'bg-yellow-100 text-yellow-800',
  NearMiss: 'bg-red-100 text-red-800'
};

const STATUS_COLORS: Record<string, string> = {
  Open: 'bg-amber-100 text-amber-800',
  Assigned: 'bg-blue-100 text-blue-800',
  Closed: 'bg-green-100 text-green-800'
};

type PeriodFilter = 'this_week' | 'this_month' | 'last_3_months';

const PERIOD_LABELS: Record<PeriodFilter, string> = {
  this_week: 'This Week',
  this_month: 'This Month',
  last_3_months: 'Last 3 Months'
};

function filterByPeriod(reports: UaUcNearMissRecord[], period: PeriodFilter): UaUcNearMissRecord[] {
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

  return reports.filter(r => new Date(r.reported_at) >= start);
}

async function downloadExcel(reports: UaUcNearMissRecord[], period: PeriodFilter) {
  const ExcelJS = (await import('exceljs')).default;
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('UA UC Near Miss');

  ws.columns = [
    { header: 'No.', key: 'no', width: 6 },
    { header: 'Report No', key: 'report_no', width: 18 },
    { header: 'Type', key: 'type', width: 18 },
    { header: 'Location / Dept', key: 'location', width: 22 },
    { header: 'Submitted By', key: 'submitted_by', width: 20 },
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Assigned To', key: 'assigned_to', width: 20 },
    { header: 'Status', key: 'status', width: 12 }
  ];

  // Style header
  const headerRow = ws.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE07B39' } };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 20;

  const filtered = filterByPeriod(reports, period);
  filtered.forEach((r, idx) => {
    const row = ws.addRow({
      no: idx + 1,
      report_no: r.report_no,
      type: TYPE_LABELS[r.observation_type] ?? r.observation_type,
      location: r.location_department ?? '—',
      submitted_by: r.reported_by_name ?? '—',
      date: formatDate(r.reported_at),
      assigned_to: r.assigned_to_name ?? '—',
      status: r.status
    });

    // Status cell color
    const statusCell = row.getCell('status');
    if (r.status === 'Open') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
      statusCell.font = { color: { argb: 'FF92400E' }, bold: true };
    } else if (r.status === 'Assigned') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } };
      statusCell.font = { color: { argb: 'FF1E40AF' }, bold: true };
    } else {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
      statusCell.font = { color: { argb: 'FF065F46' }, bold: true };
    }

    row.alignment = { vertical: 'middle' };
    if (idx % 2 === 1) {
      row.eachCell({ includeEmpty: true }, cell => {
        if (!(cell.fill as any)?.fgColor || (cell.fill as any).fgColor?.argb === 'FFFFFFFF') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
        }
      });
    }
  });

  ws.addRow([]);
  const summaryRow = ws.addRow([`Total: ${filtered.length} reports`]);
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
  a.download = `ua-uc-near-miss-${period}-${new Date().toISOString().split('T')[0]}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

interface Props {
  reports: UaUcNearMissRecord[];
  detailRouteBase?: string;
  showExportButton?: boolean;
}

const ManagerUaUcListingSection = ({ reports, detailRouteBase, showExportButton = false }: Props) => {
  const [typeFilter, setTypeFilter] = useState<'All' | ObservationType>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | ObservationStatus>('All');
  const [period, setPeriod] = useState<PeriodFilter>('this_month');
  const [downloading, setDownloading] = useState(false);

  const filtered = reports.filter(r => {
    const typeMatch = typeFilter === 'All' || r.observation_type === typeFilter;
    const statusMatch = statusFilter === 'All' || r.status === statusFilter;
    return typeMatch && statusMatch;
  });

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadExcel(reports, period);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters + export */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1">
            {(['All', 'UA', 'UC', 'NearMiss'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  typeFilter === t
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-primary'
                }`}
              >
                {t === 'NearMiss' ? 'Near Miss' : t}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {(['All', 'Open', 'Assigned', 'Closed'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  statusFilter === s
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-primary'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Export — admin only */}
        {showExportButton && (
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
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">No reports found.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Report No</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-left">Submitted By</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Assigned To</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(report => (
                <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-medium">{report.report_no}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${TYPE_COLORS[report.observation_type]}`}>
                      {TYPE_LABELS[report.observation_type]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{report.location_department}</td>
                  <td className="px-4 py-3 text-gray-600">{report.reported_by_name ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {formatDate(report.reported_at)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{report.assigned_to_name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[report.status]}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`${detailRouteBase ?? '/manager/ehs/ua-uc-near-miss'}/${report.id}`}
                      className="text-primary text-xs underline font-medium"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManagerUaUcListingSection;
