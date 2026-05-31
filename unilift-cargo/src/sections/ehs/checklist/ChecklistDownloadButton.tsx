'use client';

import { Download, Loader } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ChecklistPdfDocument, { ChecklistPdfData } from '@/data/ChecklistPdfDocument';

const ChecklistDownloadButton = ({ data, fileName }: { data: ChecklistPdfData; fileName: string }) => (
  <PDFDownloadLink
    document={<ChecklistPdfDocument data={data} />}
    fileName={fileName}
    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border bg-primary text-white border-primary hover:bg-primary/90 transition-colors"
  >
    {({ loading }) => (
      <>
        {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        {loading ? 'Preparing...' : 'Download PDF'}
      </>
    )}
  </PDFDownloadLink>
);

export default ChecklistDownloadButton;
