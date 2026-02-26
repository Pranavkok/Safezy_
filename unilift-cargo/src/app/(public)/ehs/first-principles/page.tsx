import React, { Suspense } from 'react';
import ASSETS from '@/assets';
import PageBanner from '@/components/PageBanner';
import { AppRoutes } from '@/constants/AppRoutes';
import { EHSFirstPrinciplesListingSection } from '@/sections/ehs/first-principles/EHSFirstPrinciplesListingSection';
import Spinner from '@/components/loaders/Spinner';

export const metadata = {
  title: 'EHS First Principle Details',
  description:
    'Explore the details of EHS First Principles and their importance.'
};

const BREADCRUMBS = [
  { label: 'HOME', route: AppRoutes.HOME },
  { label: 'FIRST PRINCIPLES', route: AppRoutes.EHS_FIRST_PRINCIPLES }
] as const;

const FirstPrinciplesListingPage = () => {
  return (
    <div className="relative bg-gray-50 ">
      <PageBanner
        image={ASSETS.IMG.EHS_TOOLBOX_BANNER}
        pageHeading="EHS FIRST PRINCIPLES"
        breadcrumbs={BREADCRUMBS}
      />

      <Suspense
        fallback={
          <div className="flex justify-center items-center w-full h-[50vh]">
            <Spinner />
          </div>
        }
      >
        <EHSFirstPrinciplesListingSection />
      </Suspense>
    </div>
  );
};

export default FirstPrinciplesListingPage;
