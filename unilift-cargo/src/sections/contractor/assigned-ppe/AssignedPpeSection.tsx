'use client';

import { useEffect, useState } from 'react';
import Spinner from '@/components/loaders/Spinner';

type AssignedPpe = {
  id: string;
  quantity: number;
  created_at: string;
  product: { id: string; ppe_name: string; ppe_category: string; image: string | null } | null;
  admin: { first_name: string; last_name: string } | null;
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
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="text-left text-xs uppercase text-gray-500 border-b">
            <th className="px-4 py-3">PPE Name</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Quantity</th>
            <th className="px-4 py-3">Date Assigned</th>
            <th className="px-4 py-3">Assigned By</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
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
              <td className="px-4 py-3 text-gray-500">
                {item.admin
                  ? `${item.admin.first_name} ${item.admin.last_name}`.trim()
                  : 'Admin'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
