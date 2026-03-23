import ManagerDashboardLayout from '@/layouts/ManagerDashboardLayout';
import { ReactNode } from 'react';

export default function ManagerRootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return <ManagerDashboardLayout>{children}</ManagerDashboardLayout>;
}
