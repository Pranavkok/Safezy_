'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UaUcNearMissRecord, ObservationStatus } from '@/types/ehs.types';
import { AppRoutes } from '@/constants/AppRoutes';
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
  Assigned: 'bg-blue-100 text-blue-800',
  Closed: 'bg-green-100 text-green-800'
};

interface Props {
  reports: UaUcNearMissRecord[];
}

const SoUaUcListingSection = ({ reports }: Props) => {
  const [statusFilter, setStatusFilter] = useState<'All' | 'Assigned' | 'Closed'>('All');

  const filtered = reports.filter(r => {
    if (statusFilter === 'All') return true;
    return r.status === statusFilter;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-1">
        {(['All', 'Assigned', 'Closed'] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              statusFilter === s
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-600 border-gray-300 hover:border-primary'
            }`}
          >
            {s === 'Assigned' ? 'Pending' : s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">No reports assigned to you yet.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Report No</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-left">Date</th>
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
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {formatDate(report.reported_at)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[report.status] ?? ''}`}>
                      {report.status === 'Assigned' ? 'Pending' : report.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={AppRoutes.SAFETY_OFFICER_EHS_UA_UC_NEAR_MISS_DETAILS(String(report.id))}
                      className="text-primary text-xs underline font-medium"
                    >
                      {report.status === 'Assigned' ? 'Investigate' : 'View'}
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

export default SoUaUcListingSection;
