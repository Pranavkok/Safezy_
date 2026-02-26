import React from 'react';
import { Button } from './ui/button';
import { AppRoutes } from '@/constants/AppRoutes';
import Link from 'next/link';

const NoWorksiteAdded = ({ dynamicText }: { dynamicText: string }) => {
  return (
    <div className="flex flex-col items-center justify-center  text-center  rounded-lg ">
      <div className="max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          No Worksite Added
        </h2>
        <p className="text-gray-600 mb-6">
          It looks like you have not Added a worksite yet. To view {dynamicText}
          , add a new one to get started.
        </p>
        <div className="flex justify-center space-x-4">
          <Button asChild className="px-6 capitalize">
            <Link href={AppRoutes.CONTRACTOR_WORKSITE_LISTING}>
              Add New Worksite
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NoWorksiteAdded;
