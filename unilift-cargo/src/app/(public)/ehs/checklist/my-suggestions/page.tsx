export const dynamic = 'force-dynamic';

import ASSETS from '@/assets';
import PageBanner from '@/components/PageBanner';
import { AppRoutes } from '@/constants/AppRoutes';
import { getMyChecklistSuggestions } from '@/actions/admin/ehs/checklist';
import { getAuthId, getUserIdFromAuth } from '@/actions/user';
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

const ChecklistMySuggestionsPage = async ({
  searchParams
}: {
  searchParams?: { debug?: string };
}) => {
  const response = await getMyChecklistSuggestions();
  const debugEnabled = searchParams?.debug === '1';

  const debugInfo = debugEnabled
    ? {
        supabaseHost: process.env.NEXT_PUBLIC_SUPABASE_URL
          ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
          : null,
        authId: await getAuthId(),
        userId: await getUserIdFromAuth(),
        response
      }
    : null;

  return (
    <div className="bg-gray-50">
      <PageBanner
        image={ASSETS.IMG.EHS_CHECKLIST_BANNER}
        pageHeading="My Checklist Suggestions"
        breadcrumbs={BREADCRUMBS}
      />
      {debugInfo && (
        <div className="max-w-7xl mx-auto px-4 pt-6">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <h3 className="text-sm font-semibold text-amber-900 mb-3">Debug Info</h3>
            <pre className="text-xs text-amber-950 overflow-x-auto whitespace-pre-wrap break-all">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        </div>
      )}
      <ChecklistMySuggestionsSection initialResponse={response} />
    </div>
  );
};

export default ChecklistMySuggestionsPage;
