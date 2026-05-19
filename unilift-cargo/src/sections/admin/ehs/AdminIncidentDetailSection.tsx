'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminAssignIncidentReport, adminCloseIncidentReport, approveIncidentReport, rejectIncidentReport } from '@/actions/admin/ehs';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import ButtonSpinner from '@/components/ButtonSpinner';
import { IncidentAnalysisWithImageType } from '@/types/index.types';
import IncidentReport from '@/sections/ehs/incident-analysis/IncidentReport';
import { uploadFile } from '@/utils';
import { ImageIcon, FileVideo, X, Sparkles, Loader2 } from 'lucide-react';

const MAX_SIZE_BYTES = 50 * 1024 * 1024;

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
  const router = useRouter();
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [corrective, setCorrective] = useState('');
  const [preventive, setPreventive] = useState('');
  const [closing, setClosing] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [approvalRemarks, setApprovalRemarks] = useState('');
  const [rejectionRemarks, setRejectionRemarks] = useState('');
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidencePreview, setEvidencePreview] = useState<string | null>(null);
  const [evidenceType, setEvidenceType] = useState<'image' | 'video' | null>(null);
  const [generating, setGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const status = deriveStatus(incident);

  const handleAutoGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/generate-capa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incident)
      });
      const json: { success: boolean; data?: { corrective?: { points?: string[] }; preventive?: { points?: string[] } } } = await res.json();
      if (json.success && json.data) {
        const corrPoints = json.data.corrective?.points ?? [];
        const prevPoints = json.data.preventive?.points ?? [];
        setCorrective(corrPoints.map(p => `• ${p}`).join('\n'));
        setPreventive(prevPoints.map(p => `• ${p}`).join('\n'));
        toast.success('Actions generated. Review and edit before closing.');
      } else {
        toast.error('Failed to generate suggestions. Please try again.');
      }
    } catch {
      toast.error('An unexpected error occurred while generating.');
    } finally {
      setGenerating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_SIZE_BYTES) {
      toast.error('File must be smaller than 50 MB.');
      e.target.value = '';
      return;
    }
    setEvidenceFile(file);
    setEvidencePreview(URL.createObjectURL(file));
    setEvidenceType(file.type.startsWith('video/') ? 'video' : 'image');
  };

  const removeFile = () => {
    setEvidenceFile(null);
    setEvidencePreview(null);
    setEvidenceType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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
    if (!corrective.trim()) {
      toast.error('Please describe the corrective actions taken.');
      return;
    }

    setClosing(true);
    try {
      let closureImageUrl: string | null = null;
      if (evidenceFile) {
        closureImageUrl = await uploadFile(evidenceFile, 'ehs-ua-uc-media', 'closure-evidence');
      }

      const result = await adminCloseIncidentReport(incident.id, {
        corrective_actions: corrective,
        preventive_actions: preventive,
        closure_image_url: closureImageUrl
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

  const handleApprove = async () => {
    setApproving(true);
    try {
      const result = await approveIncidentReport(incident.id, approvalRemarks || undefined);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionRemarks.trim()) {
      toast.error('Please provide a reason for rejection.');
      return;
    }
    setRejecting(true);
    try {
      const result = await rejectIncidentReport(incident.id, rejectionRemarks);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      setRejecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <IncidentReport incidentDetails={incident} hideActions />

      {!incident.is_completed && (
        <div className="max-w-screen-lg mx-auto px-4 md:px-8 pb-8 space-y-4">
          {/* Assign Panel */}
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
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-green-800">Close This Incident</h3>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAutoGenerate}
                  disabled={generating || closing}
                  className="flex items-center gap-1.5 text-xs border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  {generating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  {generating ? 'Generating...' : 'Auto Generate'}
                </Button>
              </div>

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

                <div>
                  <label className="text-xs text-gray-600 mb-1 block">
                    Evidence Photo / Video <span className="text-gray-400">(optional, max 50 MB)</span>
                  </label>
                  {evidencePreview ? (
                    <div className="relative inline-block">
                      {evidenceType === 'video' ? (
                        <video src={evidencePreview} controls className="max-h-48 rounded border border-gray-200" />
                      ) : (
                        <img src={evidencePreview} alt="Evidence preview" className="max-h-48 rounded border border-gray-200 object-contain" />
                      )}
                      <button
                        type="button"
                        onClick={removeFile}
                        className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full p-0.5 text-gray-500 hover:text-red-500 shadow-sm"
                        aria-label="Remove file"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center gap-2 cursor-pointer w-fit border border-dashed border-gray-300 rounded-md px-4 py-3 text-sm text-gray-500 hover:border-primary hover:text-primary transition-colors">
                      <ImageIcon size={16} />
                      <FileVideo size={16} />
                      <span>Upload image or video</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  )}
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

      {/* Final Approval Panel — shown when closed and pending approval */}
      {incident.is_completed && (incident as any).final_approval === 'Pending' && (
        <div className="max-w-screen-lg mx-auto px-4 md:px-8 pb-8">
          <section className="border-2 border-dashed border-purple-200 rounded-lg p-4 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-purple-800">Final Approval</h3>
              <p className="text-xs text-gray-500 mt-0.5">This incident has been closed. Review and give your final approval.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Approve side */}
              <div className="space-y-2">
                <label className="text-xs text-gray-600 block">Remarks (optional)</label>
                <textarea
                  value={approvalRemarks}
                  onChange={e => setApprovalRemarks(e.target.value)}
                  placeholder="Add any remarks for approval..."
                  rows={2}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                />
                <Button
                  onClick={handleApprove}
                  disabled={approving || rejecting}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {approving ? <ButtonSpinner /> : 'Approve'}
                </Button>
              </div>

              {/* Reject side */}
              <div className="space-y-2">
                <label className="text-xs text-gray-600 block">Reason for Rejection <span className="text-red-500">*</span></label>
                <textarea
                  value={rejectionRemarks}
                  onChange={e => setRejectionRemarks(e.target.value)}
                  placeholder="Explain why this closure is being rejected..."
                  rows={2}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                />
                <Button
                  onClick={handleReject}
                  disabled={approving || rejecting}
                  variant="outline"
                  className="w-full border-red-400 text-red-700 hover:bg-red-50"
                >
                  {rejecting ? <ButtonSpinner /> : 'Reject'}
                </Button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Show final approval result if already decided */}
      {incident.is_completed && (incident as any).final_approval && (incident as any).final_approval !== 'Pending' && (
        <div className="max-w-screen-lg mx-auto px-4 md:px-8 pb-8">
          <section className={`rounded-lg p-4 border ${
            (incident as any).final_approval === 'Approved'
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <p className={`text-sm font-semibold ${
              (incident as any).final_approval === 'Approved' ? 'text-green-800' : 'text-red-800'
            }`}>
              Final Approval: {(incident as any).final_approval}
            </p>
            {(incident as any).final_approval_remarks && (
              <p className="text-xs text-gray-600 mt-1">Remarks: {(incident as any).final_approval_remarks}</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default AdminIncidentDetailSection;
