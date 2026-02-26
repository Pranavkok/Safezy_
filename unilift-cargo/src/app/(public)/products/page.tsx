import { Suspense } from 'react';
import ProductListing from '@/sections/products/product-listing';
import Spinner from '@/components/loaders/Spinner';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Safezy Safety Solutions',
  description: `Browse and purchase safety products to enhance workplace safety and protection.`
};

export default async function ProductListingPage({
  searchParams
}: {
  searchParams?: {
    category?: string;
  };
}) {
  const category = searchParams?.category ?? 'all';

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen mt-[-100px]">
          <Spinner className="w-8 h-8" />
        </div>
      }
    >
      <ProductListing category={category} />
    </Suspense>
  );
}
