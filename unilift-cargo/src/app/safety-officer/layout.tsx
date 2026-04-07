import SafetyOfficerDashboardLayout from '@/layouts/SafetyOfficerDashboardLayout';
import { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

export default function SafetyOfficerRootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return <SafetyOfficerDashboardLayout>{children}</SafetyOfficerDashboardLayout>;
}
