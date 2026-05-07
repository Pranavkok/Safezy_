import { Suspense } from 'react';
import ASSETS from '@/assets';
import Spinner from '@/components/loaders/Spinner';
import PageBanner from '@/components/PageBanner';
import { AppRoutes } from '@/constants/AppRoutes';
import ComplaintSection from '@/sections/complaint/ComplaintSection';

export const metadata = {
  title: 'Complaint | Safezy',
  description: 'Submit your complaint to Safezy. We take every concern seriously and will get back to you as soon as possible.'
};

const BREADCRUMBS = [
  { label: 'HOME', route: AppRoutes.HOME },
  { label: 'COMPLAINT', route: AppRoutes.COMPLAINT }
] as const;

const ComplaintPage = () => {
  return (
    <>
      <PageBanner
        image={ASSETS.IMG.CONTACT_US_BANNER}
        pageHeading="COMPLAINT"
        breadcrumbs={BREADCRUMBS}
        className="scale-x-[-1]"
      />
      <Suspense
        fallback={
          <div className="flex justify-center items-center w-full h-[50vh]">
            <Spinner />
          </div>
        }
      >
        <ComplaintSection />
      </Suspense>
    </>
  );
};

export default ComplaintPage;
