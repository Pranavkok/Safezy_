'use client';

import { useState } from 'react';
import { adminAssignIncidentReport, adminCloseIncidentReport } from '@/actions/admin/ehs';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import ButtonSpinner from '@/components/ButtonSpinner';
import { IncidentAnalysisWithImageType } from '@/types/index.types';
import IncidentReport from '@/sections/ehs/incident-analysis/IncidentReport';

interface SafetyOfficer {
  authId: string;
  name: string;
}

interface Props {
  incident: IncidentAnalysisWithImageType;
  safetyOfficers: SafetyOfficer[];
}

function deriveStatus(incident: IncidentAnalysisWithImageType): 'Open' | 'Assigned' | 'Closed' {
  if (incident.is_completed) return 'Closed';
  if (incident.assigned_to_user_id) return 'Assigned';
  return 'Open';
}

const AdminIncidentDetailSection = ({ incident, safetyOfficers }: Props) => {
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [corrective, setCorrective] = useState('');
  const [preventive, setPreventive] = useState('');
  const [closing, setClosing] = useState(false);

  const status = deriveStatus(incident);

  const handleAssign = async () => {
    if (!selectedOfficer) {
      toast.error('Please select a Safety Officer to assign.');
      return;
    }
    const officer = safetyOfficers.find(o => o.authId === selectedOfficer);
    if (!officer) return;

    setAssigning(true);
    try {
      const result = await adminAssignIncidentReport(incident.id, officer.authId, officer.name);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      setAssigning(false);
    }
  };

  const handleClose = async () => {
    if (!corrective.trim()) {
      toast.error('Please describe the corrective actions taken.');
      return;
    }

    setClosing(true);
    try {
      const result = await adminCloseIncidentReport(incident.id, {
        corrective_actions: corrective,
        preventive_actions: preventive
      });
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      setClosing(false);
    }
  };

  return (
    <div className="space-y-6">
      <IncidentReport incidentDetails={incident} hideActions />

      {!incident.is_completed && (
        <div className="max-w-screen-lg mx-auto px-4 md:px-8 pb-8 space-y-4">
          {/* Assign Panel */}
          <section className="border-2 border-dashed border-blue-200 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-semibold text-blue-800">
              {status === 'Assigned' ? 'Reassign to Safety Officer' : 'Assign to Safety Officer'}
            </h3>
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

          {/* Close Panel — shown when assigned */}
          {status === 'Assigned' && (
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
          )}
        </div>
      )}
    </div>
  );
};

export default AdminIncidentDetailSection;
