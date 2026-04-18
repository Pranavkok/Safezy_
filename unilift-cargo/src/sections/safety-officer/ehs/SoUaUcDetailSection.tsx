'use client';

import { useRef, useState } from 'react';
import { UaUcNearMissRecord } from '@/types/ehs.types';
import { closeUaUcReport } from '@/actions/safety-officer/ehs';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import ButtonSpinner from '@/components/ButtonSpinner';
import UaUcReportViewer from '@/sections/ehs/ua-uc-near-miss/UaUcReportViewer';
import { uploadFile } from '@/utils';
import { ImageIcon, X } from 'lucide-react';

const MAX_SIZE_BYTES = 3 * 1024 * 1024;

interface Props {
  report: UaUcNearMissRecord;
  officerName: string;
}

const SoUaUcDetailSection = ({ report, officerName }: Props) => {
  const today = new Date().toISOString().split('T')[0];
  const [actionTaken, setActionTaken] = useState('');
  const [actionDate, setActionDate] = useState(today);
  const [closing, setClosing] = useState(false);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidencePreview, setEvidencePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_SIZE_BYTES) {
      toast.error('Image must be smaller than 3 MB.');
      e.target.value = '';
      return;
    }
    setEvidenceFile(file);
    setEvidencePreview(URL.createObjectURL(file));
  };

  const removeFile = () => {
    setEvidenceFile(null);
    setEvidencePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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

      const result = await closeUaUcReport(report.id, {
        action_taken: actionTaken,
        action_by: officerName,
        action_date: actionDate,
        closure_image_url: closureImageUrl
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
      <UaUcReportViewer report={report} />

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
                min={today}
                max={today}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-xs text-gray-600 mb-1 block">
                Evidence Photo <span className="text-gray-400">(optional, max 3 MB)</span>
              </label>
              {evidencePreview ? (
                <div className="relative inline-block">
                  <img
                    src={evidencePreview}
                    alt="Evidence preview"
                    className="max-h-48 rounded border border-gray-200 object-contain"
                  />
                  <button
                    type="button"
                    onClick={removeFile}
                    className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full p-0.5 text-gray-500 hover:text-red-500 shadow-sm"
                    aria-label="Remove image"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-2 cursor-pointer w-fit border border-dashed border-gray-300 rounded-md px-4 py-3 text-sm text-gray-500 hover:border-primary hover:text-primary transition-colors">
                  <ImageIcon size={16} />
                  <span>Upload image</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
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
  );
};

export default SoUaUcDetailSection;
