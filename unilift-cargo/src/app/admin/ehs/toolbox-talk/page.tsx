import React, { Suspense } from 'react';
import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import ToolboxTalkListingSection from '@/sections/admin/ehs/toolbox-talks/EhsToolboxTalkListingSection';
import { SearchParamsType } from '@/types/index.types';
import { AppRoutes } from '@/constants/AppRoutes';
import Spinner from '@/components/loaders/Spinner';

const BREADCRUMBS = [
  { label: 'Dashboard', route: `${AppRoutes.ADMIN_DASHBOARD}` },
  {
    label: 'Toolbox Talk',
    route: AppRoutes.ADMIN_EHS_TOOLBOX_TALK_LISTING
  }
] as const;

const ToolboxTalkListingPage = ({ searchParams }: SearchParamsType) => {
  return (
    <AdminTopbarLayout
      title="EHS Toolbox Talks"
      breadcrumbOptions={BREADCRUMBS}
    >
      <Suspense
        fallback={
          <div className="flex justify-center items-center w-full h-[50vh]">
            <Spinner />
          </div>
        }
      >
        <ToolboxTalkListingSection searchParams={searchParams} />
      </Suspense>
    </AdminTopbarLayout>
  );
};

export default ToolboxTalkListingPage;
