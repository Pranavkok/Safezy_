import { notFound } from 'next/navigation';
import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import { AppRoutes } from '@/constants/AppRoutes';
import { createClient } from '@/utils/supabase/server';
import { getSafetyOfficersList } from '@/actions/manager/ehs';
import AdminUaUcDetailSection from '@/sections/admin/ehs/AdminUaUcDetailSection';

interface Props {
  params: { id: string };
}

const AdminUaUcDetailPage = async ({ params }: Props) => {
  const supabase = await createClient();

  const { data: report, error } = await supabase
    .from('ehs_ua_uc_near_miss')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !report) return notFound();

  const officersResult = await getSafetyOfficersList();
  const safetyOfficers = officersResult.data ?? [];

  const BREADCRUMBS = [
    { label: 'Dashboard', route: AppRoutes.ADMIN_DASHBOARD },
    { label: 'UA / UC / Near Miss', route: AppRoutes.ADMIN_EHS_UA_UC_NEAR_MISS_LISTING },
    { label: report.report_no, route: AppRoutes.ADMIN_EHS_UA_UC_NEAR_MISS_DETAILS(params.id) }
  ] as const;

  return (
    <AdminTopbarLayout title={report.report_no} breadcrumbOptions={BREADCRUMBS}>
      <AdminUaUcDetailSection report={report} safetyOfficers={safetyOfficers} />
    </AdminTopbarLayout>
  );
};

export default AdminUaUcDetailPage;
