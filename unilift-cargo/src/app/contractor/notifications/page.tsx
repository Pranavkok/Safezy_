import { AppRoutes } from '@/constants/AppRoutes';
import ContractorTopbarLayout from '@/layouts/ContractorTopbarLayout';
import NotificationSection from '@/sections/contractor/notification';
import React from 'react';

const BREADCRUMBS = [
  { label: 'Dashboard', route: AppRoutes.CONTRACTOR_DASHBOARD },
  {
    label: 'Notifications',
    route: AppRoutes.CONTRACTOR_NOTIFICATION
  }
] as const;

const NotificationsPage = () => {
  return (
    <ContractorTopbarLayout
      title="Notifications"
      breadcrumbOptions={BREADCRUMBS}
    >
      <NotificationSection />
    </ContractorTopbarLayout>
  );
};

export default NotificationsPage;
