import { AppRoutes } from '@/constants/AppRoutes';
import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import EhsChecklistAddSection from '@/sections/admin/ehs/checklist/EhsChecklistAddSection';

const BREADCRUMBS = [
  { label: 'Dashboard', route: AppRoutes.ADMIN_DASHBOARD },
  {
    label: 'Checklist',
    route: AppRoutes.ADMIN_EHS_CHECKLIST_LISTING
  },
  {
    label: 'Add',
    route: AppRoutes.ADMIN_EHS_CHECKLIST_ADD
  }
] as const;

const EhsChecklistAddPage = () => {
  return (
    <AdminTopbarLayout
      title="Ehs Checklist Add"
      breadcrumbOptions={BREADCRUMBS}
    >
      <EhsChecklistAddSection />{' '}
    </AdminTopbarLayout>
  );
};

export default EhsChecklistAddPage;
