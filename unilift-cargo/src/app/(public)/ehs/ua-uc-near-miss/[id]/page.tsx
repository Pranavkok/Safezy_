import { getUaUcReportById } from '@/actions/contractor/ua-uc-near-miss';
import UaUcReportPage from '@/sections/ehs/ua-uc-near-miss/UaUcReportPage';
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
      <UaUcReportPage report={report} />
    </div>
  );
};

export default UaUcNearMissDetailsPage;
