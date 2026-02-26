import Spinner from '@/components/loaders/Spinner';
import { AppRoutes } from '@/constants/AppRoutes';
import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import ProductListingSection from '@/sections/admin/products/ProductListingSection';
import { SearchParamsType } from '@/types/index.types';
import { Suspense } from 'react';

const BREADCRUMBS = [
  {
    label: 'Dashboard',
    route: AppRoutes.ADMIN_DASHBOARD
  },
  {
    label: 'Products',
    route: AppRoutes.ADMIN_PRODUCT_LISTING
  }
];

const AdminProductListingPage = ({ searchParams }: SearchParamsType) => {
  return (
    <AdminTopbarLayout title="Products" breadcrumbOptions={BREADCRUMBS}>
      <Suspense
        fallback={
          <div className="flex justify-center items-center w-full h-[50vh]">
            <Spinner />
          </div>
        }
      >
        <ProductListingSection searchParams={searchParams} />{' '}
      </Suspense>
    </AdminTopbarLayout>
  );
};

export default AdminProductListingPage;
