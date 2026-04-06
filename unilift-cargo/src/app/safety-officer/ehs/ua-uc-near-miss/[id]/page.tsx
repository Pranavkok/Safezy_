export const dynamic = 'force-dynamic';

import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import { AppRoutes } from '@/constants/AppRoutes';
import { createServiceClient } from '@/utils/supabase/service';
import { getUserDetails } from '@/actions/user';
import SoUaUcDetailSection from '@/sections/safety-officer/ehs/SoUaUcDetailSection';

interface Props {
  params: { id: string };
}

const SoUaUcDetailPage = async ({ params }: Props) => {
  const serviceClient = createServiceClient();

  const { data: report, error } = await serviceClient
    .from('ehs_ua_uc_near_miss')
    .select('*')
    .eq('id', Number(params.id))
    .single();

  if (error || !report) {
    return (
      <AdminTopbarLayout title="UA / UC / Near Miss">
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-600">
          Failed to load the report details. Please go back and try again.
        </div>
      </AdminTopbarLayout>
    );
  }

  const userDetails = await getUserDetails();
  const officerName = `${userDetails.firstName ?? ''} ${userDetails.lastName ?? ''}`.trim();

  const BREADCRUMBS = [
    { label: 'Dashboard', route: AppRoutes.SAFETY_OFFICER_DASHBOARD },
    { label: 'UA / UC / Near Miss', route: AppRoutes.SAFETY_OFFICER_EHS_UA_UC_NEAR_MISS_LISTING },
    { label: report.report_no, route: AppRoutes.SAFETY_OFFICER_EHS_UA_UC_NEAR_MISS_DETAILS(params.id) }
  ] as const;

  return (
    <AdminTopbarLayout title={report.report_no} breadcrumbOptions={BREADCRUMBS}>
      <SoUaUcDetailSection report={report} officerName={officerName} />
    </AdminTopbarLayout>
  );
};

export default SoUaUcDetailPage;
