import React from 'react';
import { notFound } from 'next/navigation';
import ASSETS from '@/assets';
import PageBanner from '@/components/PageBanner';
import { AppRoutes } from '@/constants/AppRoutes';
import { getChecklistSubmissionById } from '@/actions/contractor/checklist';
import ChecklistSubmissionViewer from '@/sections/ehs/checklist/ChecklistSubmissionViewer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checklist Submission | Safezy',
  description: 'View your submitted EHS checklist.'
};

const BREADCRUMBS = [
  { label: 'HOME', route: AppRoutes.HOME },
  { label: 'Checklist', route: AppRoutes.EHS_CHECKLIST_LISTING },
  { label: 'My Submissions', route: AppRoutes.EHS_CHECKLIST_MY_SUBMISSIONS },
  { label: 'View Submission', route: '' }
] as const;

const ChecklistSubmissionViewPage = async ({ params }: { params: { id: string } }) => {
  const res = await getChecklistSubmissionById(Number(params.id));

  if (!res.success || !res.data) {
    notFound();
  }

  return (
    <div className="bg-gray-50">
      <div className="print:hidden">
        <PageBanner
          image={ASSETS.IMG.EHS_CHECKLIST_BANNER}
          pageHeading="Checklist Submission"
          breadcrumbs={BREADCRUMBS}
        />
      </div>
      <div className="mt-10 print:mt-0 max-w-3xl mx-auto px-4 py-8 print:py-4 w-full">
        <ChecklistSubmissionViewer submission={res.data} />
      </div>
    </div>
  );
};

export default ChecklistSubmissionViewPage;
