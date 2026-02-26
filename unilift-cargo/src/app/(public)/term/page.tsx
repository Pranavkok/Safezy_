import Spinner from '@/components/loaders/Spinner';
import TermAndConditions from '@/sections/term-and-condition/TermAndConditions';
import { Suspense } from 'react';

export const metadata = {
  title: 'Terms & Conditions | Safezy',
  description:
    'Learn more about Safezy, our mission, values, and commitment to safety and excellence.'
};

const TermAndConditionPage = () => {
  return (
    <>
      <Suspense
        fallback={
          <div className="flex justify-center items-center w-full h-[50vh]">
            <Spinner />
          </div>
        }
      >
        <TermAndConditions />
      </Suspense>
    </>
  );
};

export default TermAndConditionPage;
