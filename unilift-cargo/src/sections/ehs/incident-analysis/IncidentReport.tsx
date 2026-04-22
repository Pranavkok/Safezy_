'use client';

import React, { useState } from 'react';
import { IncidentAnalysisWithImageType } from '@/types/index.types';
import dynamic from 'next/dynamic';
import { Pencil } from 'lucide-react';
import IncidentReportHtmlViewer from './Incident-report/IncidentReportHtmlViewer';
import ResubmitReportButton from './Incident-report/ResubmitReportButton';
import IncidentReportInlineEditor from './Incident-report/IncidentReportInlineEditor';

const PDFDownloadButton = dynamic(
  () =>
    import('./Incident-report/IncidentReportDownloadButton').then(
      mod => mod.default
    ),
  {
    ssr: false
  }
);

const IncidentReport = ({
  incidentDetails,
  canEdit = false,
  hideActions = false
}: {
  incidentDetails: IncidentAnalysisWithImageType;
  canEdit?: boolean;
  hideActions?: boolean;
}) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="w-full max-w-screen-lg mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-primary">
          Incident Investigation Report
        </h2>
        {!hideActions && !isEditing && (
          <div className="flex items-center gap-3">
            <ResubmitReportButton incidentId={incidentDetails.id} />
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-primary text-primary rounded-md hover:bg-primary hover:text-white transition-colors"
            >
              <Pencil size={14} />
              Edit Report
            </button>
            <PDFDownloadButton incidentDetails={incidentDetails} />
          </div>
        )}
      </div>

      <div className="mb-8 border border-gray-200 rounded-lg overflow-hidden">
        {isEditing ? (
          <IncidentReportInlineEditor
            incidentDetails={incidentDetails}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <IncidentReportHtmlViewer incidentDetails={incidentDetails} />
        )}
      </div>
    </div>
  );
};

export default IncidentReport;
