import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import ChecklistPdfDocument, { ChecklistPdfData } from '@/data/ChecklistPdfDocument';

export async function generateChecklistPdfBase64(data: ChecklistPdfData): Promise<string> {
  const buffer = await renderToBuffer(<ChecklistPdfDocument data={data} />);
  return Buffer.from(buffer).toString('base64');
}
