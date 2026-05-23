'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { IncidentListItem } from '@/actions/manager/ehs';
import { formatDate } from '@/utils/date';
import { Download, ChevronDown, X } from 'lucide-react';

type IncidentStatus = 'Open' | 'Assigned' | 'Closed';
type PeriodFilter = 'this_week' | 'this_month' | 'last_3_months';

function deriveStatus(incident: IncidentListItem): IncidentStatus {
  if (incident.is_completed) return 'Closed';
  if (incident.assigned_to_user_id) return 'Assigned';
  return 'Open';
}

const STATUS_COLORS: Record<IncidentStatus, string> = {
  Open: 'bg-amber-100 text-amber-800',
  Assigned: 'bg-blue-100 text-blue-800',
  Closed: 'bg-green-100 text-green-800'
};

const PERIOD_LABELS: Record<PeriodFilter, string> = {
  this_week: 'This Week',
  this_month: 'This Month',
  last_3_months: 'Last 3 Months'
};

function filterByPeriod(incidents: IncidentListItem[], period: PeriodFilter): IncidentListItem[] {
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

  return incidents.filter(i => {
    const d = i.date ? new Date(i.date) : i.created_at ? new Date(i.created_at) : null;
    return d && d >= start;
  });
}

async function downloadExcel(incidents: IncidentListItem[], period: PeriodFilter) {
  const ExcelJS = (await import('exceljs')).default;
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Incident Analysis');

  // Header row
  ws.columns = [
    { header: 'No.', key: 'no', width: 6 },
    { header: 'Title', key: 'title', width: 30 },
    { header: 'Incident Type', key: 'incident_type', width: 20 },
    { header: 'Severity', key: 'severity_level', width: 15 },
    { header: 'Location', key: 'location', width: 20 },
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Reported By', key: 'reported_by', width: 22 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Final Approver', key: 'final_approval', width: 16 },
    { header: 'Final Approved/Closed', key: 'closed_at', width: 22 },
    { header: 'Remarks', key: 'remarks', width: 20 }
  ];

  // Style header
  const headerRow = ws.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE07B39' } };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 20;

  // Data rows
  const filtered = filterByPeriod(incidents, period);
  filtered.forEach((inc, idx) => {
    const status = deriveStatus(inc);

    let remarks: string;
    if (status === 'Closed') {
      remarks = formatDate(inc.updated_at);
    } else {
      const refDate = inc.date ? new Date(inc.date) : new Date(inc.created_at);
      const diffMs = Date.now() - refDate.getTime();
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      remarks = `${days} days`;
    }

    const row = ws.addRow({
      no: idx + 1,
      title: inc.title ?? '—',
      incident_type: (inc as any).incident_type ?? '—',
      severity_level: (inc as any).severity_level ?? '—',
      location: inc.location ?? '—',
      date: inc.date ? formatDate(inc.date) : '—',
      reported_by: inc.reported_by_name ?? '—',
      status,
      final_approval: inc.final_approval ?? '—',
      closed_at: inc.closed_at ? formatDate(inc.closed_at) : '—',
      remarks
    });

    // Status cell color
    const statusCell = row.getCell('status');
    if (status === 'Open') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
      statusCell.font = { color: { argb: 'FF92400E' }, bold: true };
    } else if (status === 'Assigned') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } };
      statusCell.font = { color: { argb: 'FF1E40AF' }, bold: true };
    } else {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
      statusCell.font = { color: { argb: 'FF065F46' }, bold: true };
    }

    // Final Approver cell color
    const approvalCell = row.getCell('final_approval');
    if (inc.final_approval === 'Pending') {
      approvalCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF9C3' } };
      approvalCell.font = { color: { argb: 'FF854D0E' }, bold: true };
    } else if (inc.final_approval === 'Approved') {
      approvalCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
      approvalCell.font = { color: { argb: 'FF065F46' }, bold: true };
    } else if (inc.final_approval === 'Rejected') {
      approvalCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
      approvalCell.font = { color: { argb: 'FF991B1B' }, bold: true };
    }

    row.alignment = { vertical: 'middle' };
    if (idx % 2 === 1) {
      row.eachCell({ includeEmpty: true }, cell => {
        if (!cell.fill || (cell.fill as any).fgColor?.argb === 'FFFFFFFF') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
        }
      });
    }
  });

  // Add summary row
  ws.addRow([]);
  const summaryRow = ws.addRow([`Total: ${filtered.length} reports`, '', '', '', '', '', '', '', '', '']);
  summaryRow.font = { bold: true, italic: true, color: { argb: 'FF6B7280' } };

  // Add border to all data cells
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
  a.download = `incident-analysis-${period}-${new Date().toISOString().split('T')[0]}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

interface Props {
  incidents: IncidentListItem[];
  detailRouteBase?: string;
  showExportButton?: boolean;
}

const ManagerIncidentListingSection = ({ incidents, detailRouteBase, showExportButton = false }: Props) => {
  const [statusFilter, setStatusFilter] = useState<'All' | IncidentStatus>('All');
  const [period, setPeriod] = useState<PeriodFilter>('this_month');
  const [downloading, setDownloading] = useState(false);
  const [reporterFilter, setReporterFilter] = useState<string | null>(null);
  const [reporterSearch, setReporterSearch] = useState('');
  const [reporterOpen, setReporterOpen] = useState(false);
  const reporterRef = useRef<HTMLDivElement>(null);

  const uniqueReporters = Array.from(
    new Set(incidents.map(i => i.reported_by_name).filter(Boolean))
  ).sort() as string[];

  const filteredReporters = uniqueReporters.filter(name =>
    name.toLowerCase().includes(reporterSearch.toLowerCase())
  );

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (reporterRef.current && !reporterRef.current.contains(e.target as Node)) {
        setReporterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = incidents.filter(i => {
    const statusMatch = statusFilter === 'All' || deriveStatus(i) === statusFilter;
    const reporterMatch = !reporterFilter || i.reported_by_name === reporterFilter;
    return statusMatch && reporterMatch;
  });

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadExcel(incidents, period);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top bar: filters + export */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Status filters + reporter filter */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex gap-1">
            {(['All', 'Open', 'Assigned', 'Closed'] as const).map(s => (
              <button
                key={s}
                type="button"
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

          {/* Reporter searchable dropdown */}
          <div ref={reporterRef} className="relative">
            <button
              type="button"
              onClick={() => { setReporterOpen(o => !o); setReporterSearch(''); }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                reporterFilter
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-primary'
              }`}
            >
              <span>{reporterFilter ?? 'All Reporters'}</span>
              {reporterFilter ? (
                <X
                  className="w-3 h-3"
                  onClick={e => { e.stopPropagation(); setReporterFilter(null); setReporterOpen(false); }}
                />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>

            {reporterOpen && (
              <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg w-52">
                <div className="p-2 border-b border-gray-100">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search reporter..."
                    value={reporterSearch}
                    onChange={e => setReporterSearch(e.target.value)}
                    className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <ul className="max-h-48 overflow-y-auto py-1">
                  <li>
                    <button
                      type="button"
                      onClick={() => { setReporterFilter(null); setReporterOpen(false); }}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors ${!reporterFilter ? 'font-semibold text-primary' : 'text-gray-700'}`}
                    >
                      All Reporters
                    </button>
                  </li>
                  {filteredReporters.length === 0 ? (
                    <li className="px-3 py-2 text-xs text-gray-400">No results</li>
                  ) : (
                    filteredReporters.map(name => (
                      <li key={name}>
                        <button
                          type="button"
                          onClick={() => { setReporterFilter(name); setReporterOpen(false); }}
                          className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors ${reporterFilter === name ? 'font-semibold text-primary' : 'text-gray-700'}`}
                        >
                          {name}
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Export controls — admin only */}
        {showExportButton && (
          <div className="flex items-center gap-2">
            <select
              aria-label="Select period"
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

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">No incidents found.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Reported By</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Final Approver</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(incident => {
                const status = deriveStatus(incident);
                return (
                  <tr key={incident.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium">{incident.title}</td>
                    <td className="px-4 py-3 text-gray-600">{incident.location ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {incident.date ? formatDate(incident.date) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{incident.reported_by_name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[status]}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {incident.final_approval === 'Approved' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">Approved</span>
                      )}
                      {incident.final_approval === 'Rejected' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">Rejected</span>
                      )}
                      {incident.final_approval === 'Pending' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Pending</span>
                      )}
                      {!incident.final_approval && '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`${detailRouteBase ?? '/manager/ehs/incident-analysis'}/${incident.id}`}
                        className="text-primary text-xs underline font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManagerIncidentListingSection;
