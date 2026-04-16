import { AppRoutes } from '@/constants/AppRoutes';
import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import NotificationSection from '@/sections/contractor/notification';
import React from 'react';

const BREADCRUMBS = [
  { label: 'Dashboard', route: AppRoutes.MANAGER_DASHBOARD },
  { label: 'Notifications', route: AppRoutes.MANAGER_NOTIFICATION }
] as const;

const ManagerNotificationsPage = () => {
  return (
    <AdminTopbarLayout title="Notifications" breadcrumbOptions={BREADCRUMBS}>
      <NotificationSection />
    </AdminTopbarLayout>
  );
};

export default ManagerNotificationsPage;
