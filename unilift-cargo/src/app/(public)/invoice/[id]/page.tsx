import { getInvoiceData } from '@/actions/contractor/invoice';
import InvoiceDownload from '@/components/invoice/InvoiceGenerator';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Download Invoice | Safezy',
  description: 'Download your invoice details for your order from Safezy.'
};

const InvoiceDownloadPage = async ({ params }: { params: { id: string } }) => {
  const orderId = params.id;

  if (!orderId) {
    notFound();
  }

  const response = await getInvoiceData(orderId);

  if (!response.success || !response.data) {
    notFound();
  }

  return <InvoiceDownload invoiceData={response.data} />;
};

export default InvoiceDownloadPage;
