import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import ChecklistPdfDocument, { ChecklistPdfData } from '@/data/ChecklistPdfDocument';

export async function generateChecklistPdfBase64(data: ChecklistPdfData): Promise<string> {
  const buf = await renderToBuffer(<ChecklistPdfDocument data={data} />);
  return buf.toString('base64');
}
