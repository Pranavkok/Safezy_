import React, { Suspense } from 'react';
import ASSETS from '@/assets';
import PageBanner from '@/components/PageBanner';
import { AppRoutes } from '@/constants/AppRoutes';
import { EHSToolboxTalkListingSection } from '@/sections/ehs/toolbox-talk/EhsToolboxTalkListingSection';
import Spinner from '@/components/loaders/Spinner';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EHS Toolbox Talks | Safezy',
  description:
    'Explore the latest EHS Toolbox Talks to enhance workplace safety with Safezy.'
};

const BREADCRUMBS = [
  { label: 'HOME', route: AppRoutes.HOME },
  { label: 'TOOLBOX TALKS', route: AppRoutes.ADMIN_EHS_TOOLBOX_TALK_LISTING }
] as const;

const EHSToolboxTalkListingPage = () => {
  return (
    <div className="relative bg-gray-50 ">
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
        <EHSToolboxTalkListingSection />
      </Suspense>
    </div>
  );
};

export default EHSToolboxTalkListingPage;
