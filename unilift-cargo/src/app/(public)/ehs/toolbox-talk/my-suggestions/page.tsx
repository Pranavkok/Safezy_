import ASSETS from '@/assets';
import PageBanner from '@/components/PageBanner';
import { AppRoutes } from '@/constants/AppRoutes';
import { getMyToolboxSuggestions } from '@/actions/admin/ehs/toolbox-talk';
import { getAuthId, getUserIdFromAuth } from '@/actions/user';
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

const ToolboxMySuggestionsPage = async ({
  searchParams
}: {
  searchParams?: { debug?: string };
}) => {
  const response = await getMyToolboxSuggestions();
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
        image={ASSETS.IMG.EHS_TOOLBOX_BANNER}
        pageHeading="My Toolbox Talk Suggestions"
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
      <ToolboxMySuggestionsSection initialResponse={response} />
    </div>
  );
};

export default ToolboxMySuggestionsPage;
