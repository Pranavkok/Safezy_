import ASSETS from '@/assets';
import PageBanner from '@/components/PageBanner';
import { AppRoutes } from '@/constants/AppRoutes';
import ToolboxMySubmissionsSection from '@/sections/ehs/toolbox-talk/ToolboxMySubmissionsSection';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Toolbox Talk Submissions | Safezy',
  description: 'View all your completed EHS Toolbox Talks.'
};

const BREADCRUMBS = [
  { label: 'HOME', route: AppRoutes.HOME },
  { label: 'TOOLBOX TALKS', route: AppRoutes.EHS_TOOLBOX_TALK },
  { label: 'MY SUBMISSIONS', route: AppRoutes.EHS_TOOLBOX_TALK_MY_SUBMISSIONS }
] as const;

const ToolboxMySubmissionsPage = () => {
  return (
    <div className="bg-gray-50">
      <PageBanner
        image={ASSETS.IMG.EHS_TOOLBOX_BANNER}
        pageHeading="My Toolbox Talk Submissions"
        breadcrumbs={BREADCRUMBS}
      />
      <ToolboxMySubmissionsSection />
    </div>
  );
};

export default ToolboxMySubmissionsPage;
