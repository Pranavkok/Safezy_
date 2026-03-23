'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UaUcNearMissRecord, ObservationType, ObservationStatus } from '@/types/ehs.types';
import { formatDate } from '@/utils/date';

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

interface Props {
  reports: UaUcNearMissRecord[];
  detailRouteBase?: string;
}

const ManagerUaUcListingSection = ({ reports, detailRouteBase }: Props) => {
  const [typeFilter, setTypeFilter] = useState<'All' | ObservationType>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | ObservationStatus>('All');

  const filtered = reports.filter(r => {
    const typeMatch = typeFilter === 'All' || r.observation_type === typeFilter;
    const statusMatch = statusFilter === 'All' || r.status === statusFilter;
    return typeMatch && statusMatch;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
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
