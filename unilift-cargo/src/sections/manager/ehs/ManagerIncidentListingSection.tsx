'use client';

import { useState } from 'react';
import Link from 'next/link';
import { IncidentListItem } from '@/actions/manager/ehs';
import { formatDate } from '@/utils/date';

type IncidentStatus = 'Open' | 'Assigned' | 'Closed';

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

interface Props {
  incidents: IncidentListItem[];
  detailRouteBase?: string;
}

const ManagerIncidentListingSection = ({ incidents, detailRouteBase }: Props) => {
  const [statusFilter, setStatusFilter] = useState<'All' | IncidentStatus>('All');

  const filtered = incidents.filter(i => {
    if (statusFilter === 'All') return true;
    return deriveStatus(i) === statusFilter;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
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
                <th className="px-4 py-3 text-left">Assigned To</th>
                <th className="px-4 py-3 text-left">Status</th>
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
                    <td className="px-4 py-3 text-gray-600">{incident.assigned_to_name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[status]}`}>
                        {status}
                      </span>
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
