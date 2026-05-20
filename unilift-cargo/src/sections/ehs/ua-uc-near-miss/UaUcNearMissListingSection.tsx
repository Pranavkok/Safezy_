'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUaUcReportsList } from '@/actions/contractor/ua-uc-near-miss';
import { UaUcNearMissListItem, ObservationType } from '@/types/ehs.types';
import {
  Plus,
  AlertTriangle,
  ShieldAlert,
  Zap,
  CheckCircle2,
  Clock,
  FileText,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

const OBSERVATION_META: Record<ObservationType, { label: string; color: string; icon: React.ElementType }> = {
  UA:       { label: 'Unsafe Act',       color: 'bg-red-100 text-red-700 border-red-200',         icon: AlertTriangle },
  UC:       { label: 'Unsafe Condition', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: ShieldAlert },
  NearMiss: { label: 'Near Miss',        color: 'bg-blue-100 text-blue-700 border-blue-200',       icon: Zap }
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const RowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-4 py-3"><div className="h-5 w-24 bg-gray-200 rounded-full" /></td>
    <td className="px-4 py-3"><div className="h-4 w-28 bg-gray-200 rounded" /></td>
    <td className="px-4 py-3"><div className="h-4 w-36 bg-gray-200 rounded" /></td>
    <td className="px-4 py-3"><div className="h-4 w-20 bg-gray-200 rounded" /></td>
    <td className="px-4 py-3"><div className="h-5 w-16 bg-gray-200 rounded-full" /></td>
    <td className="px-4 py-3"><div className="h-4 w-4 bg-gray-200 rounded" /></td>
  </tr>
);

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = () => (
  <tr>
    <td colSpan={6}>
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
        <FileText className="w-12 h-12 text-gray-300" />
        <p className="text-gray-600 font-medium">No reports submitted yet.</p>
        <p className="text-sm text-gray-400">Submit your first UA / UC / Near Miss report to get started.</p>
      </div>
    </td>
  </tr>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const UaUcNearMissListingSection = () => {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState<ObservationType | null>(null);
  const [statusFilter, setStatusFilter] = useState<'Open' | null>(null);

  const { data: result, isLoading } = useQuery({
    queryKey: ['ua-uc-near-miss-list'],
    queryFn: () => getUaUcReportsList(),
    refetchOnWindowFocus: false
  });

  const reports = result?.data ?? [];

  const counts = useMemo(() => ({
    total:    reports.length,
    open:     reports.filter(r => r.status === 'Open').length,
    UA:       reports.filter(r => r.observation_type === 'UA').length,
    UC:       reports.filter(r => r.observation_type === 'UC').length,
    NearMiss: reports.filter(r => r.observation_type === 'NearMiss').length
  }), [reports]);

  const filteredReports = useMemo(() => reports.filter(r => {
    if (typeFilter && r.observation_type !== typeFilter) return false;
    if (statusFilter && r.status !== statusFilter) return false;
    return true;
  }), [reports, typeFilter, statusFilter]);

  const hasFilter = typeFilter !== null || statusFilter !== null;

  const clearFilters = () => { setTypeFilter(null); setStatusFilter(null); };

  const filterLabel = [
    statusFilter === 'Open' ? 'Open' : null,
    typeFilter ? OBSERVATION_META[typeFilter].label : null
  ].filter(Boolean).join(' · ');

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">UA / UC / Near Miss Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">All your submitted observation reports</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!isLoading && reports.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowFilters(prev => !prev)}
              className={`flex items-center gap-2 ${showFilters ? 'border-primary text-primary' : ''}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filter
              {hasFilter && <span className="ml-1 w-2 h-2 rounded-full bg-primary inline-block" />}
            </Button>
          )}
          <Button
            onClick={() => router.push('/ehs/ua-uc-near-miss/add')}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Report
          </Button>
        </div>
      </div>

      {/* Summary Cards — shown only when filter panel is open */}
      {!isLoading && reports.length > 0 && showFilters && (
        <div className="grid grid-cols-5 gap-3">

          {/* Total — clears all filters */}
          <Card
            onClick={clearFilters}
            className={`text-center py-4 cursor-pointer transition-all border-2 ${
              !hasFilter
                ? 'border-gray-300 bg-gray-50'
                : 'border-transparent hover:border-gray-200 hover:bg-gray-50/60'
            }`}
          >
            <CardContent className="p-0">
              <p className="text-2xl font-bold text-gray-700">{counts.total}</p>
              <p className="text-xs text-gray-500 mt-0.5">Total</p>
            </CardContent>
          </Card>

          {/* Open */}
          <Card
            onClick={() => setStatusFilter(prev => prev === 'Open' ? null : 'Open')}
            className={`text-center py-4 cursor-pointer transition-all border-2 ${
              statusFilter === 'Open'
                ? 'border-orange-400 bg-orange-50'
                : 'border-transparent hover:border-orange-200 hover:bg-orange-50/50'
            }`}
          >
            <CardContent className="p-0">
              <p className="text-2xl font-bold text-orange-600">{counts.open}</p>
              <p className="text-xs text-gray-500 mt-0.5">Open</p>
            </CardContent>
          </Card>

          {/* UA */}
          <Card
            onClick={() => setTypeFilter(prev => prev === 'UA' ? null : 'UA')}
            className={`text-center py-4 cursor-pointer transition-all border-2 ${
              typeFilter === 'UA'
                ? 'border-red-400 bg-red-50'
                : 'border-transparent hover:border-red-200 hover:bg-red-50/50'
            }`}
          >
            <CardContent className="p-0">
              <p className="text-2xl font-bold text-red-600">{counts.UA}</p>
              <p className="text-xs text-gray-500 mt-0.5">Unsafe Act</p>
            </CardContent>
          </Card>

          {/* UC */}
          <Card
            onClick={() => setTypeFilter(prev => prev === 'UC' ? null : 'UC')}
            className={`text-center py-4 cursor-pointer transition-all border-2 ${
              typeFilter === 'UC'
                ? 'border-yellow-400 bg-yellow-50'
                : 'border-transparent hover:border-yellow-200 hover:bg-yellow-50/50'
            }`}
          >
            <CardContent className="p-0">
              <p className="text-2xl font-bold text-yellow-600">{counts.UC}</p>
              <p className="text-xs text-gray-500 mt-0.5">Unsafe Condition</p>
            </CardContent>
          </Card>

          {/* Near Miss */}
          <Card
            onClick={() => setTypeFilter(prev => prev === 'NearMiss' ? null : 'NearMiss')}
            className={`text-center py-4 cursor-pointer transition-all border-2 ${
              typeFilter === 'NearMiss'
                ? 'border-blue-400 bg-blue-50'
                : 'border-transparent hover:border-blue-200 hover:bg-blue-50/50'
            }`}
          >
            <CardContent className="p-0">
              <p className="text-2xl font-bold text-blue-600">{counts.NearMiss}</p>
              <p className="text-xs text-gray-500 mt-0.5">Near Miss</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Report No</th>
              <th className="px-4 py-3 text-left">Location</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && (
              <>
                <RowSkeleton />
                <RowSkeleton />
                <RowSkeleton />
              </>
            )}

            {!isLoading && reports.length === 0 && <EmptyState />}

            {!isLoading && reports.length > 0 && filteredReports.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                    <p className="text-gray-500 font-medium">No reports match the selected filter.</p>
                    <button type="button" onClick={clearFilters} className="text-sm text-primary underline">Clear filter</button>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading && filteredReports.map((report: UaUcNearMissListItem) => {
              const meta = OBSERVATION_META[report.observation_type] ?? OBSERVATION_META.UA;
              const Icon = meta.icon;
              const isOpen = report.status === 'Open';

              return (
                <tr
                  key={report.id}
                  onClick={() => router.push(`/ehs/ua-uc-near-miss/${report.id}`)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors group"
                >
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.color}`}>
                      <Icon className="w-3 h-3" />
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">
                    {report.report_no}
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">
                    {report.location_department}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {formatDate(report.reported_at)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      isOpen
                        ? 'bg-orange-50 text-orange-600 border-orange-200'
                        : 'bg-green-50 text-green-600 border-green-200'
                    }`}>
                      {isOpen ? <Clock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                      {report.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300 group-hover:text-primary transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!isLoading && reports.length > 0 && (
        <p className="text-xs text-gray-400 text-right">
          {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''}
          {filterLabel && ` · ${filterLabel}`}
        </p>
      )}
    </div>
  );
};

export default UaUcNearMissListingSection;
