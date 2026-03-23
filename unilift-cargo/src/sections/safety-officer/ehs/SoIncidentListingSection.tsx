'use client';

import { useState } from 'react';
import Link from 'next/link';
import { IncidentListItem } from '@/actions/manager/ehs';
import { AppRoutes } from '@/constants/AppRoutes';
import { formatDate } from '@/utils/date';

const SoIncidentListingSection = ({ incidents }: { incidents: IncidentListItem[] }) => {
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Closed'>('All');

  const filtered = incidents.filter(i => {
    if (statusFilter === 'All') return true;
    if (statusFilter === 'Closed') return i.is_completed;
    return !i.is_completed;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-1">
        {(['All', 'Pending', 'Closed'] as const).map(s => (
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
        <div className="text-center py-12 text-gray-400 text-sm">No incidents assigned to you yet.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(incident => (
                <tr key={incident.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{incident.title}</td>
                  <td className="px-4 py-3 text-gray-600">{incident.location ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {incident.date ? formatDate(incident.date) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        incident.is_completed
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {incident.is_completed ? 'Closed' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={AppRoutes.SAFETY_OFFICER_EHS_INCIDENT_ANALYSIS_DETAILS(incident.id)}
                      className="text-primary text-xs underline font-medium"
                    >
                      {incident.is_completed ? 'View' : 'Investigate'}
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

export default SoIncidentListingSection;
