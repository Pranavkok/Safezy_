import React, { Suspense } from 'react';
import ASSETS from '@/assets';
import Spinner from '@/components/loaders/Spinner';
import PageBanner from '@/components/PageBanner';
import { AppRoutes } from '@/constants/AppRoutes';
import EHSToolboxTalkSection from '@/sections/ehs/toolbox-talk/toolbox-talk-details';
import { Metadata } from 'next';
import { fetchToolboxTalkMetadataById } from '@/actions/metadata';

const BREADCRUMBS = [
  { label: 'HOME', route: AppRoutes.HOME },
  { label: 'TOOLBOX TALKS', route: AppRoutes.EHS_TOOLBOX_TALK },
  { label: 'DETAILS', route: AppRoutes.EHS_TOOLBOX_TALK_DETAILS(0) }
] as const;

export async function generateMetadata({
  params
}: {
  params: { id: number };
}): Promise<Metadata> {
  return await fetchToolboxTalkMetadataById(params.id);
}

const EHSToolboxTalkDetailsPage = ({
  params
}: {
  params: {
    id: number;
  };
}) => {
  const ehsToolboxId = params.id;

  return (
    <div className="bg-gray-50 relative flex-col items-center gap-4 justify-center">
      <PageBanner
        image={ASSETS.IMG.EHS_TOOLBOX_BANNER}
        pageHeading="EHS TOOLBOX TALKS"
        breadcrumbs={BREADCRUMBS}
      />

      <Suspense
        fallback={
          <div className="flex justify-center items-center w-full h-[50vh]">
            <Spinner />
          </div>
        }
      >
        <EHSToolboxTalkSection ehsToolboxId={ehsToolboxId} />
      </Suspense>
    </div>
  );
};

export default EHSToolboxTalkDetailsPage;
