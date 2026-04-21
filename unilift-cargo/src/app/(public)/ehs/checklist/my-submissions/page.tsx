import ASSETS from '@/assets';
import PageBanner from '@/components/PageBanner';
import { AppRoutes } from '@/constants/AppRoutes';
import ChecklistMySubmissionsSection from '@/sections/ehs/checklist/ChecklistMySubmissionsSection';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Checklist Submissions | Safezy',
  description: 'View all your submitted EHS checklists.'
};

const BREADCRUMBS = [
  { label: 'HOME', route: AppRoutes.HOME },
  { label: 'Checklist', route: AppRoutes.EHS_CHECKLIST_LISTING },
  { label: 'My Submissions', route: AppRoutes.EHS_CHECKLIST_MY_SUBMISSIONS }
] as const;

const ChecklistMySubmissionsPage = () => {
  return (
    <div className="bg-gray-50">
      <PageBanner
        image={ASSETS.IMG.EHS_CHECKLIST_BANNER}
        pageHeading="My Checklist Submissions"
        breadcrumbs={BREADCRUMBS}
      />
      <ChecklistMySubmissionsSection />
    </div>
  );
};

export default ChecklistMySubmissionsPage;
