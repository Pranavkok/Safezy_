import React from 'react';
import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import { AppRoutes } from '@/constants/AppRoutes';
import dynamic from 'next/dynamic';
const EhsToolboxTalkAddSection = dynamic(
  () => import('@/sections/admin/ehs/toolbox-talks/EhsToolboxTalkAddSection'),
  {
    ssr: false
  }
);

const BREADCRUMBS = [
  { label: 'Dashboard', route: `${AppRoutes.ADMIN_DASHBOARD}` },
  {
    label: 'Toolbox Talk',
    route: AppRoutes.ADMIN_EHS_TOOLBOX_TALK_LISTING
  },
  {
    label: 'Add',
    route: AppRoutes.ADMIN_EHS_TOOLBOX_TALK_ADD
  }
] as const;

const AdminEshToolBoxTalkPage = () => {
  return (
    <AdminTopbarLayout
      title="EHS Toolbox Talks"
      breadcrumbOptions={BREADCRUMBS}
    >
      <EhsToolboxTalkAddSection />
    </AdminTopbarLayout>
  );
};

export default AdminEshToolBoxTalkPage;
