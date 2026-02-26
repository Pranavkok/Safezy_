import { IncidentAnalysisWithImageType } from '@/types/index.types';
import { PDFViewer } from '@react-pdf/renderer';
import React from 'react';
import IncidentReportPdf from './IncidentReportPdf';

const IncidentReportViewer = ({
  incidentDetails
}: {
  incidentDetails: IncidentAnalysisWithImageType;
}) => {
  return (
    <PDFViewer style={{ width: '100%', height: '800px' }}>
      <IncidentReportPdf incidentDetails={incidentDetails} />
    </PDFViewer>
  );
};

export default IncidentReportViewer;
