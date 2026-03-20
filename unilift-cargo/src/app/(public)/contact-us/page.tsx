import { Suspense } from 'react';
import ASSETS from '@/assets';
import Spinner from '@/components/loaders/Spinner';
import PageBanner from '@/components/PageBanner';
import { AppRoutes } from '@/constants/AppRoutes';
import ContactUsSection from '@/sections/contact-us/ContactUsSection';

export const metadata = {
  title: 'Contact Us | Safezy',
  description:
    'For bulk purchase inquiries or to become a Safezy supplier, fill out the Contact Us form with your details. We are here to assist you!'
};

const BREADCRUMBS = [
  { label: 'HOME', route: AppRoutes.HOME },
  { label: 'CONTACT US', route: AppRoutes.CONTACT_US }
] as const;

const ContactUsPage = () => {
  return (
    <>
      <PageBanner
        image={ASSETS.IMG.CONTACT_US_BANNER}
        pageHeading="CONTACT US"
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
        <ContactUsSection />;
      </Suspense>
    </>
  );
};

export default ContactUsPage;
