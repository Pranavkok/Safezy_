'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { assignIncidentReport } from '@/actions/manager/ehs';
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

const ManagerIncidentDetailSection = ({ incident, safetyOfficers }: Props) => {
  const router = useRouter();
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [assigning, setAssigning] = useState(false);

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
      const result = await assignIncidentReport(incident.id, officer.authId, officer.name);
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

  return (
    <div className="space-y-6">
      {/* Full incident report — identical to what the submitter sees */}
      <IncidentReport incidentDetails={incident} hideActions />

      {/* Assign Panel */}
      {!incident.is_completed && (
        <div className="max-w-screen-lg mx-auto px-4 md:px-8 pb-8">
          <section className="border-2 border-dashed border-blue-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-semibold text-blue-800">
                {status === 'Assigned' ? 'Reassign to Safety Officer' : 'Assign to Safety Officer'}
              </h3>
              {status === 'Assigned' && incident.assigned_to_name && (
                <span className="text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-0.5">
                  Currently: <span className="font-medium text-blue-700">{incident.assigned_to_name}</span>
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
                      <option key={o.authId} value={o.authId}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Button onClick={handleAssign} disabled={assigning || !selectedOfficer} className="min-w-28">
                  {assigning ? <ButtonSpinner /> : 'Assign'}
                </Button>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default ManagerIncidentDetailSection;
