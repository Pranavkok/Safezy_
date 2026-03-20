import AuthTopbarLayout from '@/layouts/AuthTopbarLayout';
import { ReactNode } from 'react';

export default function AuthRootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return <AuthTopbarLayout>{children}</AuthTopbarLayout>;
}
