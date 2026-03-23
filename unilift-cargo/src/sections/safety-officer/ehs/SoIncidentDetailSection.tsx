'use client';

import { useState } from 'react';
import { closeIncidentReport } from '@/actions/safety-officer/ehs';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import ButtonSpinner from '@/components/ButtonSpinner';
import { IncidentAnalysisWithImageType } from '@/types/index.types';
import IncidentReport from '@/sections/ehs/incident-analysis/IncidentReport';

interface Props {
  incident: IncidentAnalysisWithImageType;
}

const SoIncidentDetailSection = ({ incident }: Props) => {
  const [corrective, setCorrective] = useState('');
  const [preventive, setPreventive] = useState('');
  const [closing, setClosing] = useState(false);

  const handleClose = async () => {
    if (!corrective.trim()) {
      toast.error('Please describe the corrective actions taken.');
      return;
    }

    setClosing(true);
    try {
      const result = await closeIncidentReport(incident.id, {
        corrective_actions: corrective,
        preventive_actions: preventive
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
      {/* Full incident report — identical to what the submitter sees */}
      <IncidentReport incidentDetails={incident} hideActions />

      {/* Close Panel — only shown if not yet completed */}
      {!incident.is_completed && (
        <div className="max-w-screen-lg mx-auto px-4 md:px-8 pb-8">
          <section className="border-2 border-dashed border-green-200 rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-semibold text-green-800">Close This Incident</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">
                  Corrective Actions <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={corrective}
                  onChange={e => setCorrective(e.target.value)}
                  placeholder="Describe corrective actions taken to address the immediate cause..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-600 mb-1 block">Preventive Actions</label>
                <textarea
                  value={preventive}
                  onChange={e => setPreventive(e.target.value)}
                  placeholder="Describe preventive actions to stop recurrence..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            </div>

            <Button
              onClick={handleClose}
              disabled={closing}
              className="w-full sm:w-auto min-w-40 bg-green-700 hover:bg-green-800"
            >
              {closing ? <ButtonSpinner /> : 'Close Incident'}
            </Button>
          </section>
        </div>
      )}
    </div>
  );
};

export default SoIncidentDetailSection;
