import React, { Suspense } from 'react';
import { getFirstPrincipleById } from '@/actions/admin/ehs/first-principles';
import { AppRoutes } from '@/constants/AppRoutes';
import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import EHSFirstPrinciplesDetailsUpdateSection from '@/sections/admin/ehs/first-principles/EhsFirstPrinciplesUpdateSection';
import Spinner from '@/components/loaders/Spinner';

const BREADCRUMBS = [
  { label: 'Dashboard', route: AppRoutes.ADMIN_DASHBOARD },
  {
    label: 'EHS First Principles',
    route: AppRoutes.ADMIN_EHS_FIRST_PRINCIPLES_LISTING
  },
  {
    label: 'Update',
    route: AppRoutes.ADMIN_EHS_FIRST_PRINCIPLES_UPDATE(0)
  }
] as const;

const EhsFirstPrinciplesUpdatePage = ({
  params
}: {
  params: { id: number };
}) => {
  return (
    <AdminTopbarLayout
      title="Update First Principles"
      breadcrumbOptions={BREADCRUMBS}
    >
      <Suspense
        fallback={
          <div className="flex justify-center items-center w-full h-[50vh]">
            <Spinner />
          </div>
        }
      >
        <EHSFirstPrinciplesUpdateSection firstPrincipleId={params.id} />
      </Suspense>
    </AdminTopbarLayout>
  );
};

export default EhsFirstPrinciplesUpdatePage;

const EHSFirstPrinciplesUpdateSection = async ({
  firstPrincipleId
}: {
  firstPrincipleId: number;
}) => {
  const { data: principles } = await getFirstPrincipleById(firstPrincipleId);

  if (!principles) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-600">
        Failed to load the first principles details. Please go back and try again.
      </div>
    );
  }

  return <EHSFirstPrinciplesDetailsUpdateSection principles={principles} />;
};
