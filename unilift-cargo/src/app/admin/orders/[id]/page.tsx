import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import { AppRoutes } from '@/constants/AppRoutes';
import OrderDetailsSection from '@/sections/admin/orders/OrderDetailsSection';
import { Suspense } from 'react';
import Spinner from '@/components/loaders/Spinner';

const BREADCRUMBS = [
  { label: 'Dashboard', route: AppRoutes.ADMIN_DASHBOARD },
  {
    label: 'Orders',
    route: AppRoutes.ADMIN_ORDER_LISTING
  },
  {
    label: 'Order Details',
    route: AppRoutes.ADMIN_ORDER_DETAILS('1')
  }
] as const;

const OrderDetailsPage = ({
  params
}: {
  params: {
    id: string;
  };
}) => {
  const orderId = params.id;

  return (
    <AdminTopbarLayout title="Orders Details" breadcrumbOptions={BREADCRUMBS}>
      <Suspense
        fallback={
          <div className="flex justify-center items-center w-full h-[50vh]">
            <Spinner />
          </div>
        }
      >
        <OrderDetailsSection orderId={orderId} />
      </Suspense>
    </AdminTopbarLayout>
  );
};

export default OrderDetailsPage;
