import Spinner from '@/components/loaders/Spinner';
import { AppRoutes } from '@/constants/AppRoutes';
import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import EhsChecklistUpdateSection from '@/sections/admin/ehs/checklist/EhsChecklistUpdateSection';
import { Suspense } from 'react';

const BREADCRUMBS = [
  { label: 'Dashboard', route: AppRoutes.ADMIN_DASHBOARD },
  {
    label: 'Checklist',
    route: AppRoutes.ADMIN_EHS_CHECKLIST_LISTING
  },
  {
    label: 'Details',
    route: AppRoutes.ADMIN_EHS_CHECKLIST_UPDATE(0)
  }
] as const;

const AdminEhsChecklistUpdatePage = ({
  params
}: {
  params: { id: number };
}) => {
  return (
    <AdminTopbarLayout title="EHS Checklist" breadcrumbOptions={BREADCRUMBS}>
      <Suspense
        fallback={
          <div className="flex justify-center items-center w-full h-[50vh]">
            <Spinner />
          </div>
        }
      >
        <EhsChecklistUpdateSection checklistTopicId={params.id} />
      </Suspense>
    </AdminTopbarLayout>
  );
};

export default AdminEhsChecklistUpdatePage;
