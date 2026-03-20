import React from 'react';
import { AppRoutes } from '@/constants/AppRoutes';
import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import dynamic from 'next/dynamic';
const EHSFirstPrinciplesAddSection = dynamic(
  () =>
    import(
      '@/sections/admin/ehs/first-principles/EhsFirstPrinciplesAddSection'
    ),
  {
    ssr: false
  }
);

const BREADCRUMBS = [
  { label: 'Dashboard', route: AppRoutes.ADMIN_DASHBOARD },
  {
    label: 'EHS First Principles',
    route: AppRoutes.ADMIN_EHS_FIRST_PRINCIPLES_LISTING
  },
  {
    label: 'Add',
    route: AppRoutes.ADMIN_EHS_FIRST_PRINCIPLES_ADD
  }
] as const;

const EhsFirstPrinciplesAddPage = () => {
  return (
    <AdminTopbarLayout
      title="Add First Principles"
      breadcrumbOptions={BREADCRUMBS}
    >
      <EHSFirstPrinciplesAddSection />
    </AdminTopbarLayout>
  );
};

export default EhsFirstPrinciplesAddPage;
