import BackButtonHeader from '@/components/BackButton';
import Spinner from '@/components/loaders/Spinner';
import NavigationBreadcrumbs from '@/components/NavigationBreadcrumbs';
import { AppRoutes } from '@/constants/AppRoutes';
import RecommendationProductListing from '@/sections/recommendation/recommendation-product-listing';
import { Metadata } from 'next';
import React, { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Recommendation Products | Safezy',
  description: 'Explore recommended products tailored for your needs on Safezy.'
};

const breadcrumbItems = [
  { label: 'Home', route: AppRoutes.HOME },
  { label: 'Recommendation', route: '/' }
] as const;

const RecommendedProductPage = async () => {
  return (
    <div className=" flex flex-col ">
      <div className="w-[95vw] sm:w-[90vw] mx-auto space-y-4">
        <div className="flex gap-1  my-5 h-14 lg:h-16 rounded items-center">
          <BackButtonHeader />
          <div className=" bg-white flex h-full w-full  flex-col justify-center px-4">
            <h1 className="font-bold uppercase text-sm lg:text-xl">
              Recommendation Products
            </h1>
            <NavigationBreadcrumbs breadcrumbOptions={breadcrumbItems} />
          </div>
        </div>
        <div className="">
          <Suspense
            fallback={
              <div>
                <Spinner className="w-8 h-8" />
              </div>
            }
          >
            <RecommendationProductListing />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default RecommendedProductPage;
