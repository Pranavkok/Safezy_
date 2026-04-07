import ContractorDashboardLayout from '@/layouts/ContractorDashboardLayout';
import { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

export default function ContractorRootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return <ContractorDashboardLayout>{children}</ContractorDashboardLayout>;
}
