import ASSETS from '@/assets';
import Spinner from '@/components/loaders/Spinner';
import PageBanner from '@/components/PageBanner';
import { AppRoutes } from '@/constants/AppRoutes';
import EhsChecklistListingSection from '@/sections/ehs/checklist/EhsChecklistListingSection';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'EHS Checklist | Safezy',
  description:
    'Browse and manage EHS checklists to ensure workplace safety and compliance.'
};

const BREADCRUMBS = [
  { label: 'HOME', route: AppRoutes.HOME },
  { label: 'Checklist', route: AppRoutes.EHS_NEWS_DETAILS(1) }
] as const;

const EhsChecklistListingPage = () => {
  return (
    <div className="bg-gray-50  ">
      <PageBanner
        image={ASSETS.IMG.EHS_CHECKLIST_BANNER}
        pageHeading="EHS Checklist"
        breadcrumbs={BREADCRUMBS}
      />
      <Suspense
        fallback={
          <div className="flex justify-center items-center w-full h-[50vh]">
            <Spinner />
          </div>
        }
      >
        <EhsChecklistListingSection />
      </Suspense>
    </div>
  );
};

export default EhsChecklistListingPage;
