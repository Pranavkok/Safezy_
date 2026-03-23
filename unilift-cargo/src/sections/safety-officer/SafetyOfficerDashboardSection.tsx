import React from 'react';
import Link from 'next/link';
import { getSafetyOfficerDashboardStats } from '@/actions/safety-officer/ehs';
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

const SafetyOfficerDashboardSection = async () => {
  const { data } = await getSafetyOfficerDashboardStats();

  const uaUc = data?.uaUc ?? { assigned: 0, closed: 0 };
  const incidents = data?.incidents ?? { assigned: 0, closed: 0 };

  return (
    <div className="space-y-8">
      <h2 className="text-lg font-semibold">My Assignments Overview</h2>

      {/* UA / UC / Near Miss */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-600" />
            <h3 className="font-medium text-sm">UA / UC / Near Miss</h3>
          </div>
          <Link
            href={AppRoutes.SAFETY_OFFICER_EHS_UA_UC_NEAR_MISS_LISTING}
            className="text-xs text-primary underline"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Pending" value={uaUc.assigned} color="bg-blue-50 text-blue-800" />
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
            href={AppRoutes.SAFETY_OFFICER_EHS_INCIDENT_ANALYSIS_LISTING}
            className="text-xs text-primary underline"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Pending" value={incidents.assigned} color="bg-blue-50 text-blue-800" />
          <StatCard label="Closed" value={incidents.closed} color="bg-green-50 text-green-800" />
        </div>
      </div>
    </div>
  );
};

export default SafetyOfficerDashboardSection;
