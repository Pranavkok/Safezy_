'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getIncidentAnalysisList } from '@/actions/contractor/incident-analysis';
import { IncidentAnalysisListItem, IncidentAnalysisStatus } from '@/types/ehs.types';
import { AppRoutes } from '@/constants/AppRoutes';
import {
  Plus,
  ChevronRight,
  FileText,
  CheckCircle2,
  Clock,
  UserCheck
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(str: string | null) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

function deriveStatus(item: IncidentAnalysisListItem): IncidentAnalysisStatus {
  if (item.is_completed) return 'Closed';
  if (item.assigned_to_user_id) return 'Assigned';
  return 'Open';
}

type StatusFilter = IncidentAnalysisStatus | 'All';

// ─── Filter Pills ─────────────────────────────────────────────────────────────

function FilterPill<T extends string>({
  value, active, onClick, label
}: { value: T; active: boolean; onClick: (v: T) => void; label: string }) {
  return (
    <button
      onClick={() => onClick(value)}
      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
        active
          ? 'bg-primary text-white border-primary'
          : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
      }`}
    >
      {label}
    </button>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const RowSkeleton = () => (
  <div className="animate-pulse flex items-center gap-4 p-4 border rounded-lg bg-white">
    <div className="flex-1 h-4 bg-gray-200 rounded" />
    <div className="w-24 h-4 bg-gray-200 rounded" />
    <div className="w-20 h-4 bg-gray-200 rounded" />
    <div className="w-16 h-5 bg-gray-200 rounded-full" />
    <div className="w-4 h-4 bg-gray-200 rounded" />
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = ({ filtered }: { filtered: boolean }) => (
  <div className="flex flex-col items-center justify-center min-h-[300px] text-center space-y-3">
    <FileText className="w-12 h-12 text-gray-300" />
    <p className="text-gray-600 font-medium">
      {filtered ? 'No reports match the selected filters.' : 'No incident reports submitted yet.'}
    </p>
    {!filtered && (
      <p className="text-sm text-gray-400">Submit your first incident analysis report to get started.</p>
    )}
  </div>
);

// ─── Status Badge ──────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<IncidentAnalysisStatus, { color: string; icon: React.ElementType }> = {
  Open:     { color: 'bg-orange-50 text-orange-600 border-orange-200', icon: Clock },
  Assigned: { color: 'bg-blue-50 text-blue-600 border-blue-200',       icon: UserCheck },
  Closed:   { color: 'bg-green-50 text-green-600 border-green-200',    icon: CheckCircle2 }
};

// ─── Report Row ───────────────────────────────────────────────────────────────

const ReportRow = ({ report, onClick }: { report: IncidentAnalysisListItem; onClick: () => void }) => {
  const status = deriveStatus(report);
  const { color, icon: Icon } = STATUS_STYLES[status];

  return (
    <div
      onClick={onClick}
      className="group flex flex-col sm:flex-row sm:items-center gap-3 p-4 border border-gray-200 rounded-lg bg-white hover:border-primary hover:shadow-sm cursor-pointer transition-all duration-200"
    >
      {/* Title */}
      <span className="font-medium text-sm text-gray-900 flex-1 truncate">
        {report.title}
      </span>

      {/* Incident type */}
      {report.incident_type && (
        <span className="text-xs text-gray-500 flex-shrink-0 hidden sm:block">
          {report.incident_type}
        </span>
      )}

      {/* Severity */}
      {report.severity_level && (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
          report.severity_level === 'High'   ? 'bg-red-50 text-red-600 border border-red-200' :
          report.severity_level === 'Medium' ? 'bg-yellow-50 text-yellow-600 border border-yellow-200' :
                                               'bg-gray-50 text-gray-600 border border-gray-200'
        }`}>
          {report.severity_level}
        </span>
      )}

      {/* Date */}
      <span className="text-xs text-gray-400 flex-shrink-0">
        {formatDate(report.date ?? report.created_at)}
      </span>

      {/* Status badge */}
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${color}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>

      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary flex-shrink-0 hidden sm:block transition-colors" />
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const IncidentAnalysisListingSection = () => {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');

  const { data: result, isLoading } = useQuery({
    queryKey: ['incident-analysis-list'],
    queryFn: () => getIncidentAnalysisList(),
    refetchOnWindowFocus: false
  });

  const reports = result?.data ?? [];

  const filtered = useMemo(() => {
    if (statusFilter === 'All') return reports;
    return reports.filter(r => deriveStatus(r) === statusFilter);
  }, [reports, statusFilter]);

  const counts = useMemo(() => ({
    total:    reports.length,
    open:     reports.filter(r => deriveStatus(r) === 'Open').length,
    assigned: reports.filter(r => deriveStatus(r) === 'Assigned').length,
    closed:   reports.filter(r => deriveStatus(r) === 'Closed').length
  }), [reports]);

  const isFiltered = statusFilter !== 'All';

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Incident Analysis Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">All your submitted incident analysis reports</p>
        </div>
        <Button
          onClick={() => router.push(AppRoutes.EHS_INCIDENT_ANALYSIS_ADD)}
          className="flex items-center gap-2 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Report
        </Button>
      </div>

      {/* ── Summary Cards ── */}
      {!isLoading && reports.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total',    value: counts.total,    color: 'text-gray-700'   },
            { label: 'Open',     value: counts.open,     color: 'text-orange-600' },
            { label: 'Assigned', value: counts.assigned, color: 'text-blue-600'   },
            { label: 'Closed',   value: counts.closed,   color: 'text-green-600'  }
          ].map(({ label, value, color }) => (
            <Card key={label} className="text-center py-3">
              <CardContent className="p-0">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Status Filter ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-gray-500">Status:</span>
        {(['All', 'Open', 'Assigned', 'Closed'] as StatusFilter[]).map(v => (
          <FilterPill
            key={v}
            value={v}
            active={statusFilter === v}
            onClick={setStatusFilter}
            label={v}
          />
        ))}
      </div>

      {/* ── List ── */}
      <div className="space-y-2">
        {isLoading && (
          <>
            <RowSkeleton />
            <RowSkeleton />
            <RowSkeleton />
          </>
        )}

        {!isLoading && filtered.length === 0 && (
          <EmptyState filtered={isFiltered} />
        )}

        {!isLoading && filtered.length > 0 && filtered.map(report => (
          <ReportRow
            key={report.id}
            report={report}
            onClick={() => router.push(AppRoutes.EHS_INCIDENT_ANALYSIS_REPORT(report.id))}
          />
        ))}
      </div>

      {/* ── Footer count ── */}
      {!isLoading && filtered.length > 0 && (
        <p className="text-xs text-gray-400 text-right">
          Showing {filtered.length} of {reports.length} report{reports.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
};

export default IncidentAnalysisListingSection;
