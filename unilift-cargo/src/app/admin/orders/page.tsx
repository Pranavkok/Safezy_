import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import { AppRoutes } from '@/constants/AppRoutes';
import OrderListingSection from '@/sections/admin/orders/OrderListingSection';
import React, { Suspense } from 'react';
import { SearchParamsType } from '@/types/index.types';
import Spinner from '@/components/loaders/Spinner';

const BREADCRUMBS = [
  { label: 'Dashboard', route: AppRoutes.ADMIN_DASHBOARD },
  {
    label: 'Orders',
    route: AppRoutes.ADMIN_ORDER_LISTING
  }
] as const;

const AdminOrderListingPage = ({ searchParams }: SearchParamsType) => {
  return (
    <AdminTopbarLayout title="Orders" breadcrumbOptions={BREADCRUMBS}>
      <Suspense
        fallback={
          <div className="flex justify-center items-center w-full h-[50vh]">
            <Spinner />
          </div>
        }
      >
        <OrderListingSection searchParams={searchParams} />
      </Suspense>
    </AdminTopbarLayout>
  );
};

export default AdminOrderListingPage;
