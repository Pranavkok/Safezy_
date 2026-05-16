'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUaUcReportsList, getUaUcReportById } from '@/actions/contractor/ua-uc-near-miss';
import { UaUcNearMissListItem, ObservationType } from '@/types/ehs.types';
import {
  Plus,
  ChevronRight,
  AlertTriangle,
  ShieldAlert,
  Zap,
  CheckCircle2,
  Clock,
  FileText,
  ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import UaUcReportPage from './UaUcReportPage';
import Spinner from '@/components/loaders/Spinner';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

const OBSERVATION_META: Record<ObservationType, { label: string; color: string; icon: React.ElementType }> = {
  UA:       { label: 'Unsafe Act',       color: 'bg-red-100 text-red-700 border-red-200',    icon: AlertTriangle },
  UC:       { label: 'Unsafe Condition', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: ShieldAlert },
  NearMiss: { label: 'Near Miss',        color: 'bg-blue-100 text-blue-700 border-blue-200',  icon: Zap }
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const RowSkeleton = () => (
  <div className="animate-pulse flex items-center gap-4 p-4 border rounded-lg bg-white">
    <div className="w-20 h-5 bg-gray-200 rounded-full" />
    <div className="flex-1 h-4 bg-gray-200 rounded" />
    <div className="w-24 h-4 bg-gray-200 rounded" />
    <div className="w-16 h-4 bg-gray-200 rounded" />
    <div className="w-16 h-5 bg-gray-200 rounded-full" />
    <div className="w-4 h-4 bg-gray-200 rounded" />
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center min-h-[300px] text-center space-y-3">
    <FileText className="w-12 h-12 text-gray-300" />
    <p className="text-gray-600 font-medium">No reports submitted yet.</p>
    <p className="text-sm text-gray-400">Submit your first UA / UC / Near Miss report to get started.</p>
  </div>
);

// ─── Report Row ───────────────────────────────────────────────────────────────

const ReportRow = ({ report, onClick }: { report: UaUcNearMissListItem; onClick: () => void }) => {
  const meta = OBSERVATION_META[report.observation_type] ?? OBSERVATION_META.UA;
  const Icon = meta.icon;
  const isOpen = report.status === 'Open';

  return (
    <div
      onClick={onClick}
      className="group flex flex-col sm:flex-row sm:items-center gap-3 p-4 border border-gray-200 rounded-lg bg-white hover:border-primary hover:shadow-sm cursor-pointer transition-all duration-200"
    >
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${meta.color}`}>
        <Icon className="w-3 h-3" />
        {meta.label}
      </span>

      <span className="font-mono text-sm font-semibold text-primary flex-shrink-0">
        {report.report_no}
      </span>

      <span className="text-sm text-gray-600 flex-1 truncate">
        {report.location_department}
      </span>

      <span className="text-xs text-gray-400 flex-shrink-0">
        {formatDate(report.reported_at)}
      </span>

      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${
        isOpen
          ? 'bg-orange-50 text-orange-600 border-orange-200'
          : 'bg-green-50 text-green-600 border-green-200'
      }`}>
        {isOpen ? <Clock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
        {report.status}
      </span>

      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary flex-shrink-0 hidden sm:block transition-colors" />
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const UaUcNearMissListingSection = () => {
  const router = useRouter();
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

  const { data: result, isLoading } = useQuery({
    queryKey: ['ua-uc-near-miss-list'],
    queryFn: () => getUaUcReportsList(),
    refetchOnWindowFocus: false
  });

  const { data: reportResult, isFetching: reportFetching } = useQuery({
    queryKey: ['ua-uc-report', selectedReportId],
    queryFn: () => getUaUcReportById(selectedReportId!),
    enabled: selectedReportId !== null,
    refetchOnWindowFocus: false
  });

  const reports = result?.data ?? [];

  const counts = useMemo(() => ({
    total:  reports.length,
    open:   reports.filter(r => r.status === 'Open').length,
    closed: reports.filter(r => r.status === 'Closed').length,
    ua:     reports.filter(r => r.observation_type === 'UA').length,
    uc:     reports.filter(r => r.observation_type === 'UC').length,
    nm:     reports.filter(r => r.observation_type === 'NearMiss').length
  }), [reports]);

  // ── Detail view ──
  if (selectedReportId !== null) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-4">
        <button
          onClick={() => setSelectedReportId(null)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Reports
        </button>

        {reportFetching && (
          <div className="flex items-center justify-center py-16">
            <Spinner />
          </div>
        )}

        {!reportFetching && reportResult?.data && (
          <UaUcReportPage report={reportResult.data} />
        )}

        {!reportFetching && !reportResult?.data && (
          <div className="flex items-center justify-center py-16 text-gray-500 text-sm">
            Report not found.
          </div>
        )}
      </div>
    );
  }

  // ── List view ──
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">UA / UC / Near Miss Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">All your submitted observation reports</p>
        </div>
        <Button onClick={() => router.push('/ehs/ua-uc-near-miss/add')} className="flex items-center gap-2 flex-shrink-0">
          <Plus className="w-4 h-4" />
          New Report
        </Button>
      </div>

      {/* Summary Cards */}
      {!isLoading && reports.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total',     value: counts.total,  color: 'text-gray-700'   },
            { label: 'Open',      value: counts.open,   color: 'text-orange-600' },
            { label: 'Closed',    value: counts.closed, color: 'text-green-600'  },
            { label: 'UA',        value: counts.ua,     color: 'text-red-600'    },
            { label: 'UC',        value: counts.uc,     color: 'text-yellow-600' },
            { label: 'Near Miss', value: counts.nm,     color: 'text-blue-600'   }
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

      {/* List */}
      <div className="space-y-2">
        {isLoading && (
          <>
            <RowSkeleton />
            <RowSkeleton />
            <RowSkeleton />
          </>
        )}

        {!isLoading && reports.length === 0 && <EmptyState />}

        {!isLoading && reports.map(report => (
          <ReportRow
            key={report.id}
            report={report}
            onClick={() => setSelectedReportId(report.id)}
          />
        ))}
      </div>

      {!isLoading && reports.length > 0 && (
        <p className="text-xs text-gray-400 text-right">
          {reports.length} report{reports.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
};

export default UaUcNearMissListingSection;
