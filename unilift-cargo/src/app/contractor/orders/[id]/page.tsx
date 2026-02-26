import React, { Suspense } from 'react';
import { AppRoutes } from '@/constants/AppRoutes';
import { notFound } from 'next/navigation';
import ContractorTopbarLayout from '@/layouts/ContractorTopbarLayout';
import ContractorOrderDetailsSection from '@/sections/contractor/orders/OrderDetailsSection';
import Spinner from '@/components/loaders/Spinner';

const BREADCRUMBS = [
  { label: 'Dashboard', route: `${AppRoutes.CONTRACTOR_DASHBOARD}` },
  {
    label: 'Orders',
    route: `${AppRoutes.CONTRACTOR_ORDER_LISTING}`
  },
  {
    label: 'Order Details',
    route: `${AppRoutes.CONTRACTOR_ORDER_DETAILS}`
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

  if (!orderId) {
    notFound();
  }

  return (
    <ContractorTopbarLayout
      title="Order Details"
      breadcrumbOptions={BREADCRUMBS}
    >
      <Suspense
        fallback={
          <div className="flex justify-center items-center w-full h-[50vh]">
            <Spinner />
          </div>
        }
      >
        <ContractorOrderDetailsSection orderId={orderId} />
      </Suspense>
    </ContractorTopbarLayout>
  );
};

export default OrderDetailsPage;
