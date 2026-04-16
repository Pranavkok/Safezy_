import React, { Suspense } from 'react';
import { AppRoutes } from '@/constants/AppRoutes';
import { notFound } from 'next/navigation';
import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import ContractorOrderDetailsSection from '@/sections/contractor/orders/OrderDetailsSection';
import Spinner from '@/components/loaders/Spinner';

const BREADCRUMBS = [
  { label: 'Dashboard', route: AppRoutes.SAFETY_OFFICER_DASHBOARD },
  { label: 'Orders', route: AppRoutes.SAFETY_OFFICER_ORDER_LISTING },
  { label: 'Order Details', route: AppRoutes.SAFETY_OFFICER_ORDER_LISTING }
] as const;

const SafetyOfficerOrderDetailsPage = ({
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
    <AdminTopbarLayout title="Order Details" breadcrumbOptions={BREADCRUMBS}>
      <Suspense
        fallback={
          <div className="flex justify-center items-center w-full h-[50vh]">
            <Spinner />
          </div>
        }
      >
        <ContractorOrderDetailsSection orderId={orderId} />
      </Suspense>
    </AdminTopbarLayout>
  );
};

export default SafetyOfficerOrderDetailsPage;
