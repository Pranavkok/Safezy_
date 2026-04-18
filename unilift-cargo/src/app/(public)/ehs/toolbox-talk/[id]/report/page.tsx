import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import ASSETS from '@/assets';
import Spinner from '@/components/loaders/Spinner';
import PageBanner from '@/components/PageBanner';
import { AppRoutes } from '@/constants/AppRoutes';
import { getMyToolboxCompletion } from '@/actions/contractor/toolbox-talk';
import ToolboxTalkReportViewer from '@/sections/ehs/toolbox-talk/ToolboxTalkReportViewer';

const ToolboxTalkReportDownloadButton = dynamic(
  () => import('@/sections/ehs/toolbox-talk/ToolboxTalkReportDownloadButton'),
  { ssr: false }
);

const BREADCRUMBS = [
  { label: 'HOME', route: AppRoutes.HOME },
  { label: 'TOOLBOX TALKS', route: AppRoutes.EHS_TOOLBOX_TALK },
  { label: 'REPORT', route: '#' }
] as const;

const ToolboxTalkReportPage = async ({ params }: { params: { id: number } }) => {
  const res = await getMyToolboxCompletion(Number(params.id));

  if (!res.success || !res.data) {
    notFound();
  }

  const report = res.data;

  return (
    <div className="bg-gray-50 relative flex-col items-center gap-4 justify-center">
      <PageBanner
        image={ASSETS.IMG.EHS_TOOLBOX_BANNER}
        pageHeading="EHS TOOLBOX TALK — COMPLETION REPORT"
        breadcrumbs={BREADCRUMBS}
      />

      <div className="mt-10 max-w-3xl mx-auto px-4 py-8 w-full">
        {/* Download button */}
        <div className="flex justify-end mb-6">
          <Suspense fallback={null}>
            <ToolboxTalkReportDownloadButton report={report} />
          </Suspense>
        </div>

        <ToolboxTalkReportViewer report={report} />
      </div>
    </div>
  );
};

export default ToolboxTalkReportPage;
