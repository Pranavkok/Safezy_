import React from 'react';
import EhsNewsListingSection from '@/sections/admin/ehs/ehs-news/EhsNewsListingSection';
import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import { AppRoutes } from '@/constants/AppRoutes';

const BREADCRUMBS = [
  { label: 'Dashboard', route: AppRoutes.ADMIN_DASHBOARD },
  {
    label: 'News Feed',
    route: AppRoutes.ADMIN_EHS_NEWS_LISTING
  }
] as const;

const AdminEhsNewsListingPage = () => {
  return (
    <AdminTopbarLayout title="ehs NEws Feed" breadcrumbOptions={BREADCRUMBS}>
      <EhsNewsListingSection />
    </AdminTopbarLayout>
  );
};

export default AdminEhsNewsListingPage;
