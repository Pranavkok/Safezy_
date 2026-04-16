import { AppRoutes } from '@/constants/AppRoutes';
import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import NotificationSection from '@/sections/contractor/notification';
import React from 'react';

const BREADCRUMBS = [
  { label: 'Dashboard', route: AppRoutes.SAFETY_OFFICER_DASHBOARD },
  { label: 'Notifications', route: AppRoutes.SAFETY_OFFICER_NOTIFICATION }
] as const;

const SafetyOfficerNotificationsPage = () => {
  return (
    <AdminTopbarLayout title="Notifications" breadcrumbOptions={BREADCRUMBS}>
      <NotificationSection />
    </AdminTopbarLayout>
  );
};

export default SafetyOfficerNotificationsPage;
