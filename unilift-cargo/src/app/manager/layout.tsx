import ManagerDashboardLayout from '@/layouts/ManagerDashboardLayout';
import { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

export default function ManagerRootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return <ManagerDashboardLayout>{children}</ManagerDashboardLayout>;
}
