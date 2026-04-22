import ASSETS from '@/assets';
import PageBanner from '@/components/PageBanner';
import { AppRoutes } from '@/constants/AppRoutes';
import { getMyToolboxSuggestions } from '@/actions/admin/ehs/toolbox-talk';
import ToolboxMySuggestionsSection from '@/sections/ehs/toolbox-talk/ToolboxMySuggestionsSection';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Toolbox Talk Suggestions | Safezy',
  description: 'View all your submitted Toolbox Talk suggestions.'
};

const BREADCRUMBS = [
  { label: 'HOME', route: AppRoutes.HOME },
  { label: 'TOOLBOX TALKS', route: AppRoutes.EHS_TOOLBOX_TALK },
  { label: 'MY SUGGESTIONS', route: AppRoutes.EHS_TOOLBOX_TALK_MY_SUGGESTIONS }
] as const;

const ToolboxMySuggestionsPage = async () => {
  const response = await getMyToolboxSuggestions();

  return (
    <div className="bg-gray-50">
      <PageBanner
        image={ASSETS.IMG.EHS_TOOLBOX_BANNER}
        pageHeading="My Toolbox Talk Suggestions"
        breadcrumbs={BREADCRUMBS}
      />
      <ToolboxMySuggestionsSection initialResponse={response} />
    </div>
  );
};

export default ToolboxMySuggestionsPage;
