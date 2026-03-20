import Spinner from '@/components/loaders/Spinner';
import { AppRoutes } from '@/constants/AppRoutes';
import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import WarehouseListingSection from '@/sections/admin/warehouse/WarehouseListingSection';
import { SearchParamsType } from '@/types/index.types';
import { Suspense } from 'react';

const BREADCRUMBS = [
  {
    label: 'Dashboard',
    route: AppRoutes.ADMIN_DASHBOARD
  },
  {
    label: 'Warehouse',
    route: AppRoutes.ADMIN_WAREHOUSE
  }
];
const WarehouseListingPage = ({ searchParams }: SearchParamsType) => {
  return (
    <AdminTopbarLayout title="Warehouse" breadcrumbOptions={BREADCRUMBS}>
      <Suspense
        fallback={
          <div className="flex justify-center items-center w-full h-[50vh]">
            <Spinner />
          </div>
        }
      >
        <WarehouseListingSection searchParams={searchParams} />
      </Suspense>
    </AdminTopbarLayout>
  );
};

export default WarehouseListingPage;
