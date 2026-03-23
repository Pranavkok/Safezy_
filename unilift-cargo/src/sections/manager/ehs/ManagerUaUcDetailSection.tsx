'use client';

import { useState } from 'react';
import { UaUcNearMissRecord } from '@/types/ehs.types';
import { assignUaUcReport } from '@/actions/manager/ehs';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import ButtonSpinner from '@/components/ButtonSpinner';
import UaUcReportViewer from '@/sections/ehs/ua-uc-near-miss/UaUcReportViewer';

interface SafetyOfficer {
  authId: string;
  name: string;
}

interface Props {
  report: UaUcNearMissRecord;
  safetyOfficers: SafetyOfficer[];
}

const ManagerUaUcDetailSection = ({ report, safetyOfficers }: Props) => {
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [assigning, setAssigning] = useState(false);

  const handleAssign = async () => {
    if (!selectedOfficer) {
      toast.error('Please select a Safety Officer to assign.');
      return;
    }
    const officer = safetyOfficers.find(o => o.authId === selectedOfficer);
    if (!officer) return;

    setAssigning(true);
    try {
      const result = await assignUaUcReport(report.id, officer.authId, officer.name);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Full report — identical to what the submitter sees */}
      <UaUcReportViewer report={report} />

      {/* Assign Panel — only for Open or Assigned reports */}
      {report.status !== 'Closed' && (
        <section className="border-2 border-dashed border-blue-200 rounded-lg p-4 space-y-3 max-w-3xl mx-auto">
          <h3 className="text-sm font-semibold text-blue-800">
            {report.status === 'Assigned' ? 'Reassign to Safety Officer' : 'Assign to Safety Officer'}
          </h3>
          {safetyOfficers.length === 0 ? (
            <p className="text-sm text-gray-500">No active Safety Officers available. Add one from Staff Management.</p>
          ) : (
            <div className="flex gap-3 flex-wrap items-end">
              <div className="flex-1 min-w-48">
                <label className="text-xs text-gray-600 mb-1 block">Select Safety Officer</label>
                <select
                  value={selectedOfficer}
                  onChange={e => setSelectedOfficer(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Choose officer...</option>
                  {safetyOfficers.map(o => (
                    <option key={o.authId} value={o.authId}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={handleAssign}
                disabled={assigning || !selectedOfficer}
                className="min-w-28"
              >
                {assigning ? <ButtonSpinner /> : 'Assign'}
              </Button>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default ManagerUaUcDetailSection;
