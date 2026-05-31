import { buffer as streamToBuffer } from 'stream/consumers';
import { pdf } from '@react-pdf/renderer';
import ChecklistPdfDocument, { ChecklistPdfData } from '@/data/ChecklistPdfDocument';

export async function generateChecklistPdfBase64(data: ChecklistPdfData): Promise<string> {
  const element = ChecklistPdfDocument({ data });
  const instance = pdf(element as any);
  const stream = await instance.toBuffer();
  const buf = await streamToBuffer(stream as any);
  return buf.toString('base64');
}
