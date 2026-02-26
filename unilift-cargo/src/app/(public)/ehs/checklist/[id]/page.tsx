import React, { Suspense } from 'react';
import ASSETS from '@/assets';
import PageBanner from '@/components/PageBanner';
import { AppRoutes } from '@/constants/AppRoutes';
import Spinner from '@/components/loaders/Spinner';
import EhsChecklistDetails from '@/sections/ehs/checklist/checklist-details';
import { fetchChecklistMetadataById } from '@/actions/metadata';
import { Metadata } from 'next';

export async function generateMetadata({
  params
}: {
  params: { id: number };
}): Promise<Metadata> {
  return await fetchChecklistMetadataById(params.id);
}

const BREADCRUMBS = [
  { label: 'HOME', route: AppRoutes.HOME },
  { label: 'Checklist', route: AppRoutes.EHS_CHECKLIST_LISTING },
  { label: 'EHS Checklist Details', route: '' }
] as const;

const ChecklistDetailsPage = ({ params }: { params: { id: number } }) => {
  const checklistTopicId = params.id;

  return (
    <div className="relative bg-gray-50 ">
      <PageBanner
        image={ASSETS.IMG.EHS_CHECKLIST_BANNER}
        pageHeading={'Ehs Checklist Details'}
        breadcrumbs={BREADCRUMBS}
      />

      <Suspense
        fallback={
          <div className="flex justify-center items-center w-full h-[50vh]">
            <Spinner />
          </div>
        }
      >
        <EhsChecklistDetails checklistTopicId={checklistTopicId} />
      </Suspense>
    </div>
  );
};

export default ChecklistDetailsPage;
