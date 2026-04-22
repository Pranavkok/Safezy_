import ASSETS from '@/assets';
import PageBanner from '@/components/PageBanner';
import { AppRoutes } from '@/constants/AppRoutes';
import { getMyChecklistSuggestions } from '@/actions/admin/ehs/checklist';
import ChecklistMySuggestionsSection from '@/sections/ehs/checklist/ChecklistMySuggestionsSection';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Checklist Suggestions | Safezy',
  description: 'View all your submitted EHS checklist suggestions.'
};

const BREADCRUMBS = [
  { label: 'HOME', route: AppRoutes.HOME },
  { label: 'Checklist', route: AppRoutes.EHS_CHECKLIST_LISTING },
  { label: 'My Suggestions', route: AppRoutes.EHS_CHECKLIST_MY_SUGGESTIONS }
] as const;

const ChecklistMySuggestionsPage = async () => {
  const response = await getMyChecklistSuggestions();

  return (
    <div className="bg-gray-50">
      <PageBanner
        image={ASSETS.IMG.EHS_CHECKLIST_BANNER}
        pageHeading="My Checklist Suggestions"
        breadcrumbs={BREADCRUMBS}
      />
      <ChecklistMySuggestionsSection initialResponse={response} />
    </div>
  );
};

export default ChecklistMySuggestionsPage;
