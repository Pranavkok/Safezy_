import React from 'react';
import Link from 'next/link';
import { getManagerDashboardStats } from '@/actions/manager/ehs';
import { AppRoutes } from '@/constants/AppRoutes';
import { AlertTriangle, FileText } from 'lucide-react';

const StatCard = ({
  label,
  value,
  color
}: {
  label: string;
  value: number;
  color: string;
}) => (
  <div className={`rounded-lg p-4 flex flex-col gap-1 ${color}`}>
    <span className="text-2xl font-bold">{value}</span>
    <span className="text-xs font-medium uppercase tracking-wide opacity-80">{label}</span>
  </div>
);

const ManagerDashboardSection = async () => {
  const { data } = await getManagerDashboardStats();

  const uaUc = data?.uaUc ?? { open: 0, assigned: 0, closed: 0 };
  const incidents = data?.incidents ?? { open: 0, assigned: 0, closed: 0 };

  return (
    <div className="space-y-8">
      <h2 className="text-lg font-semibold">Overview</h2>

      {/* UA / UC / Near Miss */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-600" />
            <h3 className="font-medium text-sm">UA / UC / Near Miss</h3>
          </div>
          <Link
            href={AppRoutes.MANAGER_EHS_UA_UC_NEAR_MISS_LISTING}
            className="text-xs text-primary underline"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Open" value={uaUc.open} color="bg-amber-50 text-amber-800" />
          <StatCard label="Assigned" value={uaUc.assigned} color="bg-blue-50 text-blue-800" />
          <StatCard label="Closed" value={uaUc.closed} color="bg-green-50 text-green-800" />
        </div>
      </div>

      {/* Incident Analysis */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-red-600" />
            <h3 className="font-medium text-sm">Incident Analysis</h3>
          </div>
          <Link
            href={AppRoutes.MANAGER_EHS_INCIDENT_ANALYSIS_LISTING}
            className="text-xs text-primary underline"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Open" value={incidents.open} color="bg-amber-50 text-amber-800" />
          <StatCard label="Assigned" value={incidents.assigned} color="bg-blue-50 text-blue-800" />
          <StatCard label="Closed" value={incidents.closed} color="bg-green-50 text-green-800" />
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboardSection;
