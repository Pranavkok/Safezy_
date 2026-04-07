import PrincipalEmployerDashboardLayout from '@/layouts/PrincipalEmployerDashboardLayout';
import { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

export default function PrincipalEmployerRootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <PrincipalEmployerDashboardLayout>
      {children}
    </PrincipalEmployerDashboardLayout>
  );
}
