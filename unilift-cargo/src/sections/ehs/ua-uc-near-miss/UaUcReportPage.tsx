'use client';

import React, { useState } from 'react';
import { UaUcNearMissRecord } from '@/types/ehs.types';
import { Pencil } from 'lucide-react';
import UaUcReportViewer from './UaUcReportViewer';
import UaUcReportInlineEditor from './UaUcReportInlineEditor';
import dynamic from 'next/dynamic';

const UaUcReportDownloadButton = dynamic(
  () => import('./UaUcReportDownloadButton').then(mod => mod.default),
  { ssr: false }
);

const UaUcReportPage = ({ report }: { report: UaUcNearMissRecord }) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-6">
      {!isEditing && (
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-primary text-primary rounded-md hover:bg-primary hover:text-white transition-colors"
          >
            <Pencil size={14} />
            Edit Report
          </button>
          <UaUcReportDownloadButton report={report} />
        </div>
      )}

      {isEditing ? (
        <UaUcReportInlineEditor
          report={report}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <UaUcReportViewer report={report} />
      )}
    </div>
  );
};

export default UaUcReportPage;
