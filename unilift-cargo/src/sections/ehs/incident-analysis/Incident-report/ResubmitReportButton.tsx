'use client';

import { resubmitIncidentReport } from '@/actions/contractor/incident-analysis';
import { AppRoutes } from '@/constants/AppRoutes';
import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const ResubmitReportButton = ({ incidentId }: { incidentId: number }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleResubmit = async () => {
    setLoading(true);
    const { success } = await resubmitIncidentReport(incidentId);
    if (success) {
      router.push(AppRoutes.EHS_INCIDENT_ANALYSIS_UPDATE(incidentId));
    } else {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleResubmit}
      disabled={loading}
      className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-primary text-primary rounded-md hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
      {loading ? 'Reopening...' : 'Resubmit Report'}
    </button>
  );
};

export default ResubmitReportButton;
