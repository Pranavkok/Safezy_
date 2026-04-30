'use client';

import { useEffect, useState } from 'react';
import Spinner from '@/components/loaders/Spinner';

type AssignedPpe = {
  id: string;
  quantity: number;
  created_at: string;
  product: {
    id: string;
    ppe_name: string;
    ppe_category: string;
    image: string | null;
    use_life: number | null;
  } | null;
  admin: { first_name: string; last_name: string } | null;
};

type ExpiryStatus = 'expired' | 'expiring_soon' | 'active';

function getExpiryInfo(createdAt: string, useLife: number | null): {
  status: ExpiryStatus;
  expiryDate: Date | null;
} {
  if (!useLife) return { status: 'active', expiryDate: null };

  const expiry = new Date(createdAt);
  expiry.setMonth(expiry.getMonth() + useLife);

  const now = new Date();
  const diffDays = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { status: 'expired', expiryDate: expiry };
  if (diffDays <= 7) return { status: 'expiring_soon', expiryDate: expiry };
  return { status: 'active', expiryDate: expiry };
}

const ROW_STYLES: Record<ExpiryStatus, string> = {
  expired: 'bg-red-50 border-l-4 border-red-500',
  expiring_soon: 'bg-amber-50 border-l-4 border-amber-400',
  active: 'hover:bg-gray-50'
};

const STATUS_BADGE: Record<ExpiryStatus, { label: string; className: string }> = {
  expired: { label: 'Expired', className: 'bg-red-100 text-red-700' },
  expiring_soon: { label: 'Expiring Soon', className: 'bg-amber-100 text-amber-700' },
  active: { label: 'Active', className: 'bg-green-100 text-green-700' }
};

export default function AssignedPpeSection() {
  const [data, setData] = useState<AssignedPpe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/contractor/assigned-ppe')
      .then((r) => r.json())
      .then((json) => {
        if (json.error) setError(json.error);
        else setData(json.data ?? []);
      })
      .catch(() => setError('Failed to load assigned PPE.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500 py-10">{error}</p>;
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[40vh] text-gray-400">
        <p className="text-lg font-medium">No PPE assigned yet.</p>
        <p className="text-sm mt-1">PPE assigned to you by the admin will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-red-400" /> Expired
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-amber-400" /> Expiring within 7 days
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-green-400" /> Active
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs uppercase text-gray-500 border-b">
              <th className="px-4 py-3">PPE Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Date Assigned</th>
              <th className="px-4 py-3">Expiry Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Assigned By</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => {
              const { status, expiryDate } = getExpiryInfo(
                item.created_at,
                item.product?.use_life ?? null
              );
              const badge = STATUS_BADGE[status];

              return (
                <tr
                  key={item.id}
                  className={`border-b last:border-0 transition-colors ${ROW_STYLES[status]}`}
                >
                  <td className="px-4 py-3 font-medium">{item.product?.ppe_name ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{item.product?.ppe_category ?? '—'}</td>
                  <td className="px-4 py-3">{item.quantity}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(item.created_at).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {expiryDate
                      ? expiryDate.toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })
                      : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badge.className}`}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {item.admin
                      ? `${item.admin.first_name} ${item.admin.last_name}`.trim()
                      : 'Admin'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
