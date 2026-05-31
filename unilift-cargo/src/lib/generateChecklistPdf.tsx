import React from 'react';
import { pdf } from '@react-pdf/renderer';
import ChecklistPdfDocument, { ChecklistPdfData } from '@/data/ChecklistPdfDocument';

export async function generateChecklistPdfBase64(data: ChecklistPdfData): Promise<string> {
  const element = ChecklistPdfDocument({ data });
  const instance = pdf(element as any);
  const buffer = await instance.toBuffer();
  return Buffer.from(buffer).toString('base64');
}
