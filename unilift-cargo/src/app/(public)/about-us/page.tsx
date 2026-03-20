import ASSETS from '@/assets';
import Spinner from '@/components/loaders/Spinner';
import PageBanner from '@/components/PageBanner';
import { AppRoutes } from '@/constants/AppRoutes';
import AboutUsSection from '@/sections/about-us/AboutUsSection';
import { Suspense } from 'react';

export const metadata = {
  title: 'About Us | Safezy',
  description:
    'Learn more about Safezy, our mission, values, and commitment to safety and excellence.'
};

const BREADCRUMBS = [
  { label: 'HOME', route: AppRoutes.HOME },
  { label: 'ABOUT US', route: AppRoutes.ABOUT_US }
] as const;

const AboutUsPage = () => {
  return (
    <>
      <PageBanner
        image={ASSETS.IMG.ABOUT_US_BANNER}
        pageHeading="ABOUT US"
        breadcrumbs={BREADCRUMBS}
      />

      <Suspense
        fallback={
          <div className="flex justify-center items-center w-full h-[50vh]">
            <Spinner />
          </div>
        }
      >
        <AboutUsSection />
      </Suspense>
    </>
  );
};

export default AboutUsPage;
