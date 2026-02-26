import React from 'react';
import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import EhsChecklistListingSection from '@/sections/admin/ehs/checklist/EhsChecklistListingSection';
import { AppRoutes } from '@/constants/AppRoutes';

const BREADCRUMBS = [
  { label: 'Dashboard', route: AppRoutes.ADMIN_DASHBOARD },
  {
    label: 'Checklist',
    route: AppRoutes.ADMIN_EHS_CHECKLIST_LISTING
  }
] as const;

const AdminEhsChecklistListingPage = () => {
  return (
    <AdminTopbarLayout title="Ehs Checklist" breadcrumbOptions={BREADCRUMBS}>
      <EhsChecklistListingSection />
    </AdminTopbarLayout>
  );
};

export default AdminEhsChecklistListingPage;
