'use client';

import React, { useMemo, useState } from 'react';
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

const STATUS_STYLES: Record<IncidentAnalysisStatus, { color: string; icon: React.ElementType }> = {
  Open:     { color: 'bg-orange-50 text-orange-600 border-orange-200', icon: Clock },
  Assigned: { color: 'bg-blue-50 text-blue-600 border-blue-200',       icon: UserCheck },
  Closed:   { color: 'bg-green-50 text-green-600 border-green-200',    icon: CheckCircle2 }
};

type ActiveCard = 'total' | IncidentAnalysisStatus;

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const RowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-4 py-3"><div className="h-4 w-48 bg-gray-200 rounded" /></td>
    <td className="px-4 py-3"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
    <td className="px-4 py-3"><div className="h-4 w-20 bg-gray-200 rounded" /></td>
    <td className="px-4 py-3"><div className="h-5 w-16 bg-gray-200 rounded-full" /></td>
    <td className="px-4 py-3"><div className="h-4 w-4 bg-gray-200 rounded" /></td>
  </tr>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const IncidentAnalysisListingSection = () => {
  const router = useRouter();
  const [activeCard, setActiveCard] = useState<ActiveCard | null>(null);

  const { data: result, isLoading } = useQuery({
    queryKey: ['incident-analysis-list'],
    queryFn: () => getIncidentAnalysisList(),
    refetchOnWindowFocus: false
  });

  const reports = result?.data ?? [];

  const counts = useMemo(() => ({
    total:    reports.length,
    Open:     reports.filter(r => deriveStatus(r) === 'Open').length,
    Assigned: reports.filter(r => deriveStatus(r) === 'Assigned').length,
    Closed:   reports.filter(r => deriveStatus(r) === 'Closed').length
  }), [reports]);

  const filteredReports = useMemo(() => {
    if (!activeCard) return [];
    if (activeCard === 'total') return reports;
    return reports.filter(r => deriveStatus(r) === activeCard);
  }, [reports, activeCard]);

  const handleCardClick = (card: ActiveCard) => {
    setActiveCard(prev => prev === card ? null : card);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">

      {/* Header */}
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

      {/* Summary Cards — always visible, click to show list */}
      {!isLoading && reports.length > 0 && (
        <div className="grid grid-cols-4 gap-3">

          {/* Total */}
          <Card
            onClick={() => handleCardClick('total')}
            className={`text-center py-4 cursor-pointer transition-all border-2 ${
              activeCard === 'total'
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
            onClick={() => handleCardClick('Open')}
            className={`text-center py-4 cursor-pointer transition-all border-2 ${
              activeCard === 'Open'
                ? 'border-orange-400 bg-orange-50'
                : 'border-transparent hover:border-orange-200 hover:bg-orange-50/50'
            }`}
          >
            <CardContent className="p-0">
              <p className="text-2xl font-bold text-orange-600">{counts.Open}</p>
              <p className="text-xs text-gray-500 mt-0.5">Open</p>
            </CardContent>
          </Card>

          {/* Assigned */}
          <Card
            onClick={() => handleCardClick('Assigned')}
            className={`text-center py-4 cursor-pointer transition-all border-2 ${
              activeCard === 'Assigned'
                ? 'border-blue-400 bg-blue-50'
                : 'border-transparent hover:border-blue-200 hover:bg-blue-50/50'
            }`}
          >
            <CardContent className="p-0">
              <p className="text-2xl font-bold text-blue-600">{counts.Assigned}</p>
              <p className="text-xs text-gray-500 mt-0.5">Assigned</p>
            </CardContent>
          </Card>

          {/* Closed */}
          <Card
            onClick={() => handleCardClick('Closed')}
            className={`text-center py-4 cursor-pointer transition-all border-2 ${
              activeCard === 'Closed'
                ? 'border-green-400 bg-green-50'
                : 'border-transparent hover:border-green-200 hover:bg-green-50/50'
            }`}
          >
            <CardContent className="p-0">
              <p className="text-2xl font-bold text-green-600">{counts.Closed}</p>
              <p className="text-xs text-gray-500 mt-0.5">Closed</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Prompt before any card is clicked */}
      {!isLoading && reports.length > 0 && !activeCard && (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-2">
          <FileText className="w-10 h-10 text-gray-300" />
          <p className="text-gray-500 font-medium">Select a category above to view reports</p>
        </div>
      )}

      {/* Empty state when no reports exist at all */}
      {!isLoading && reports.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
          <FileText className="w-12 h-12 text-gray-300" />
          <p className="text-gray-600 font-medium">No incident reports submitted yet.</p>
          <p className="text-sm text-gray-400">Submit your first incident analysis report to get started.</p>
        </div>
      )}

      {/* Table — only shown after a card is clicked */}
      {activeCard && (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Severity</th>
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

              {!isLoading && filteredReports.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                      <p className="text-gray-500 font-medium">No reports in this category.</p>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && filteredReports.map((report: IncidentAnalysisListItem) => {
                const status = deriveStatus(report);
                const { color, icon: Icon } = STATUS_STYLES[status];

                return (
                  <tr
                    key={report.id}
                    onClick={() => router.push(AppRoutes.EHS_INCIDENT_ANALYSIS_REPORT(report.id))}
                    className="hover:bg-gray-50 cursor-pointer transition-colors group"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-[260px] truncate">
                      {report.title}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatDate(report.date ?? report.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      {report.severity_level ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
                          report.severity_level === 'High'   ? 'bg-red-50 text-red-600 border-red-200' :
                          report.severity_level === 'Medium' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                                                               'bg-gray-50 text-gray-600 border-gray-200'
                        }`}>
                          {report.severity_level}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${color}`}>
                        <Icon className="w-3 h-3" />
                        {status}
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
      )}

      {activeCard && !isLoading && (
        <p className="text-xs text-gray-400 text-right">
          {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
};

export default IncidentAnalysisListingSection;
