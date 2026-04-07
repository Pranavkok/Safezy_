import AdminDashboardLayout from '@/layouts/AdminDashboardLayout';
import { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

export default function AdminRootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
}
