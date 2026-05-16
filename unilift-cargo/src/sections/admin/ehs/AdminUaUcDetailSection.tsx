'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UaUcNearMissRecord } from '@/types/ehs.types';
import { adminAssignUaUcReport, adminCloseUaUcReport } from '@/actions/admin/ehs';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import ButtonSpinner from '@/components/ButtonSpinner';
import UaUcReportViewer from '@/sections/ehs/ua-uc-near-miss/UaUcReportViewer';
import { uploadFile } from '@/utils';
import { ImageIcon, FileVideo, X, Sparkles, Loader2 } from 'lucide-react';

const MAX_SIZE_BYTES = 50 * 1024 * 1024;

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
  const today = new Date().toISOString().split('T')[0];
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [actionTaken, setActionTaken] = useState('');
  const [actionDate, setActionDate] = useState(today);
  const [closing, setClosing] = useState(false);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidencePreview, setEvidencePreview] = useState<string | null>(null);
  const [evidenceType, setEvidenceType] = useState<'image' | 'video' | null>(null);
  const [generating, setGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAutoGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/generate-ua-uc-closure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      });
      const json: { success: boolean; data?: { action_taken?: string } } = await res.json();
      if (json.success && json.data?.action_taken) {
        setActionTaken(json.data.action_taken);
        toast.success('Action generated. Review and edit before closing.');
      } else {
        toast.error('Failed to generate suggestion. Please try again.');
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
      let closureImageUrl: string | null = null;
      if (evidenceFile) {
        closureImageUrl = await uploadFile(evidenceFile, 'ehs-ua-uc-media', 'closure-evidence');
      }

      const result = await adminCloseUaUcReport(report.id, {
        action_taken: actionTaken,
        action_by: 'Admin',
        action_date: actionDate,
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
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-green-800">Close This Report</h3>
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
                    min={today}
                    max={today}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
