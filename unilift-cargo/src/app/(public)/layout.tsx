import GlobalLoader from '@/components/common/GlobalLoader';
import { CartProvider } from '@/context/CartContext';
import MainNavbarLayout from '@/layouts/MainNavbarLayout';
import { ReactNode, Suspense } from 'react';

export default function PublicPageLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <MainNavbarLayout>
      <Suspense fallback={<GlobalLoader />}>
        <CartProvider>{children}</CartProvider>
      </Suspense>
    </MainNavbarLayout>
  );
}
