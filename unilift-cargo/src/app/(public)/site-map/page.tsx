import ASSETS from '@/assets';
import Spinner from '@/components/loaders/Spinner';
import PageBanner from '@/components/PageBanner';
import { AppRoutes } from '@/constants/AppRoutes';
import SiteMapSection from '@/sections/site-map/SiteMapSection';
import { Suspense } from 'react';

export const metadata = {
  title: 'Site Map | Safezy',
  description:
    'Learn more about Safezy, our mission, values, and commitment to safety and excellence.'
};

const BREADCRUMBS = [
  { label: 'HOME', route: AppRoutes.HOME },
  { label: 'SITE MAP', route: AppRoutes.SITE_MAP }
] as const;

const SiteMapPage = () => {
  return (
    <>
      <PageBanner
        image={ASSETS.IMG.SITE_MAP_BANNER}
        pageHeading="SITE MAP"
        breadcrumbs={BREADCRUMBS}
      />

      <Suspense
        fallback={
          <div className="flex justify-center items-center w-full h-[50vh]">
            <Spinner />
          </div>
        }
      >
        <SiteMapSection />
      </Suspense>
    </>
  );
};

export default SiteMapPage;
