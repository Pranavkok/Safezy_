import { getUaUcReportById } from '@/actions/contractor/ua-uc-near-miss';
import UaUcReportViewer from '@/sections/ehs/ua-uc-near-miss/UaUcReportViewer';
import UaUcReportDownloadButton from '@/sections/ehs/ua-uc-near-miss/UaUcReportDownloadButton';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'UA / UC / Near Miss Report | Safezy',
  description: 'View observation report details.'
};

const UaUcNearMissDetailsPage = async ({ params }: { params: { id: string } }) => {
  const { data: report, success } = await getUaUcReportById(params.id as unknown as number);

  if (!success || !report) {
    notFound();
  }

  return (
    <div className="bg-gray-50 min-h-screen">
    <div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="flex justify-end">
        <UaUcReportDownloadButton report={report} />
      </div>
      <UaUcReportViewer report={report} />
    </div>
    </div>
  );
};

export default UaUcNearMissDetailsPage;
