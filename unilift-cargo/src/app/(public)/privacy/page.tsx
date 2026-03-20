import Spinner from '@/components/loaders/Spinner';
import PrivacyPolicySection from '@/sections/privacy-policy/PrivacyPolicySection';
import { Suspense } from 'react';

export const metadata = {
  title: 'Privacy Policy | Safezy',
  description:
    'Learn more about Safezy, our mission, values, and commitment to safety and excellence.'
};

const PrivacyPolicyPage = () => {
  return (
    <>
      <Suspense
        fallback={
          <div className="flex justify-center items-center w-full h-[50vh]">
            <Spinner />
          </div>
        }
      >
        <PrivacyPolicySection />
      </Suspense>
    </>
  );
};

export default PrivacyPolicyPage;
