import { Suspense } from 'react';
import { ProductsTable } from './product-listing-table/ProductListingTable';
import Spinner from '@/components/loaders/Spinner';
import { fetchSortedProducts } from '@/actions/admin/product';
import { SearchParamsType } from '@/types/index.types';

const ProductListingSection = async ({ searchParams }: SearchParamsType) => {
  const searchQuery = searchParams?.ppe_name ?? undefined;
  const sortParam = searchParams?.sort ?? undefined;
  const page = parseInt(searchParams?.page ?? '1');
  const pageSize = parseInt(searchParams?.per_page ?? '10');
  const filters = searchParams?.ppe_category ?? undefined;
  const [sortBy, sortOrder] = sortParam ? sortParam.split('.') : [];

  const products = await fetchSortedProducts(
    searchQuery,
    filters,
    sortBy,
    sortOrder,
    page,
    pageSize
  );

  return (
    <div className="bg-white">
      <Suspense
        fallback={
          <Spinner className="absolute inset-0 w-full h-full grid place-content-center" />
        }
      >
        <ProductsTable products={products} />
      </Suspense>
    </div>
  );
};

export default ProductListingSection;
