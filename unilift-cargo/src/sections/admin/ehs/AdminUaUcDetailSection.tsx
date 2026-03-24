'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UaUcNearMissRecord } from '@/types/ehs.types';
import { adminAssignUaUcReport, adminCloseUaUcReport } from '@/actions/admin/ehs';
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

const AdminUaUcDetailSection = ({ report, safetyOfficers }: Props) => {
  const router = useRouter();
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [actionTaken, setActionTaken] = useState('');
  const [actionDate, setActionDate] = useState('');
  const [closing, setClosing] = useState(false);

  const handleAssign = async () => {
    if (!selectedOfficer) {
      toast.error('Please select a Safety Officer to assign.');
      return;
    }
    const officer = safetyOfficers.find(o => o.authId === selectedOfficer);
    if (!officer) return;

    setAssigning(true);
    try {
      const result = await adminAssignUaUcReport(report.id, officer.authId, officer.name);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      setAssigning(false);
    }
  };

  const handleClose = async () => {
    if (!actionTaken.trim()) {
      toast.error('Please describe the action taken.');
      return;
    }
    if (!actionDate) {
      toast.error('Please select the action date.');
      return;
    }

    setClosing(true);
    try {
      const result = await adminCloseUaUcReport(report.id, {
        action_taken: actionTaken,
        action_by: 'Admin',
        action_date: actionDate
      });
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      setClosing(false);
    }
  };

  return (
    <div className="space-y-6">
      <UaUcReportViewer report={report} />

      {report.status !== 'Closed' && (
        <div className="space-y-4 max-w-3xl mx-auto">
          {/* Assign Panel */}
          <section className="border-2 border-dashed border-blue-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-semibold text-blue-800">
                {report.status === 'Assigned' ? 'Reassign to Safety Officer' : 'Assign to Safety Officer'}
              </h3>
              {report.status === 'Assigned' && report.assigned_to_name && (
                <span className="text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-0.5">
                  Currently: <span className="font-medium text-blue-700">{report.assigned_to_name}</span>
                </span>
              )}
            </div>
            {safetyOfficers.length === 0 ? (
              <p className="text-sm text-gray-500">No active Safety Officers available.</p>
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
                      <option key={o.authId} value={o.authId}>{o.name}</option>
                    ))}
                  </select>
                </div>
                <Button onClick={handleAssign} disabled={assigning || !selectedOfficer} className="min-w-28">
                  {assigning ? <ButtonSpinner /> : 'Assign'}
                </Button>
              </div>
            )}
          </section>

          {/* Close Panel — only shown if already assigned */}
          {report.status === 'Assigned' && (
            <section className="border-2 border-dashed border-green-200 rounded-lg p-4 space-y-4">
              <h3 className="text-sm font-semibold text-green-800">Close This Report</h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">
                    Action Taken <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={actionTaken}
                    onChange={e => setActionTaken(e.target.value)}
                    placeholder="Describe the corrective action taken..."
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-600 mb-1 block">
                    Action Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={actionDate}
                    onChange={e => setActionDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <Button
                onClick={handleClose}
                disabled={closing}
                className="w-full sm:w-auto min-w-40 bg-green-700 hover:bg-green-800"
              >
                {closing ? <ButtonSpinner /> : 'Mark as Closed'}
              </Button>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminUaUcDetailSection;
