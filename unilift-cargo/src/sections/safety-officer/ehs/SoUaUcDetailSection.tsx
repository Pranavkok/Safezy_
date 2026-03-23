'use client';

import { useState } from 'react';
import { UaUcNearMissRecord } from '@/types/ehs.types';
import { closeUaUcReport } from '@/actions/safety-officer/ehs';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import ButtonSpinner from '@/components/ButtonSpinner';
import UaUcReportViewer from '@/sections/ehs/ua-uc-near-miss/UaUcReportViewer';

interface Props {
  report: UaUcNearMissRecord;
  officerName: string;
}

const SoUaUcDetailSection = ({ report, officerName }: Props) => {
  const [actionTaken, setActionTaken] = useState('');
  const [actionDate, setActionDate] = useState('');
  const [closing, setClosing] = useState(false);

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
      const result = await closeUaUcReport(report.id, {
        action_taken: actionTaken,
        action_by: officerName,
        action_date: actionDate
      });
      if (result.success) {
        toast.success(result.message);
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
      {/* Full report — identical to what the submitter sees */}
      <UaUcReportViewer report={report} />

      {/* Close Panel — only shown if status is Assigned */}
      {report.status === 'Assigned' && (
        <section className="border-2 border-dashed border-green-200 rounded-lg p-4 space-y-4 max-w-3xl mx-auto">
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
              <label className="text-xs text-gray-600 mb-1 block">Investigated By</label>
              <input
                type="text"
                value={officerName}
                readOnly
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-500"
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
  );
};

export default SoUaUcDetailSection;
