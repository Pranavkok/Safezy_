'use client';

import React, { useState, useEffect } from 'react';
import { IncidentAnalysisWithImageType } from '@/types/index.types';
import { Loader } from 'lucide-react';
import dynamic from 'next/dynamic';

// Loading component extracted to avoid duplication
const LoadingDisplay = () => (
  <div className="w-full h-[600px] md:h-[800px] flex items-center justify-center bg-gray-100 rounded-lg">
    <div className="flex flex-col items-center">
      <Loader size={40} className="animate-spin text-primary mb-4" />
      <p className="text-gray-600">Loading PDF viewer...</p>
    </div>
  </div>
);

// Dynamically import the PDF components
const PDFViewer = dynamic(
  () =>
    import('./Incident-report/IncidentReportViewer').then(mod => mod.default),
  {
    ssr: false,
    loading: () => <LoadingDisplay />
  }
);

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
  incidentDetails
}: {
  incidentDetails: IncidentAnalysisWithImageType;
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="w-full max-w-screen-lg mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-primary">
          Incident Investigation Report
        </h2>
        <PDFDownloadButton incidentDetails={incidentDetails} />
      </div>

      <div className="mb-8 border border-gray-200 rounded-lg overflow-hidden">
        {isClient ? (
          <PDFViewer incidentDetails={incidentDetails} />
        ) : (
          <LoadingDisplay />
        )}
      </div>
    </div>
  );
};

export default IncidentReport;
