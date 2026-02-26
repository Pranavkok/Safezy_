import React, { Suspense } from 'react';
import { AppRoutes } from '@/constants/AppRoutes';
import { notFound } from 'next/navigation';

import PrincipalEmployerTopbarLayout from '@/layouts/PrincipalEmployerTopbarLayout';
import PrincipalEmployerOrderDetailsSection from '@/sections/principal-employer/orders/OrderDetailsSection';
import { cookies } from 'next/headers';
import Spinner from '@/components/loaders/Spinner';

const OrderDetailsPage = async ({
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

  const cookieStore = cookies();
  const result = cookieStore.get('uniqueCode')?.value || '';
  const cookieUniqueCode = result as string;

  const orderDetailsPageBreadcrumbs = [
    { label: 'Dashboard', route: `${AppRoutes.PRINCIPAL_EMPLOYER_DASHBOARD}` },
    {
      label: 'Orders',
      route: `${AppRoutes.PRINCIPAL_EMPLOYER_ORDER_LISTING}?uniqueCode=${cookieUniqueCode}`
    },
    {
      label: 'Order Details',
      route: `${AppRoutes.PRINCIPAL_EMPLOYER_ORDER_DETAILS}`
    }
  ] as const;

  return (
    <PrincipalEmployerTopbarLayout
      title="Order Details"
      breadcrumbOptions={orderDetailsPageBreadcrumbs}
    >
      <Suspense
        fallback={
          <Spinner className="absolute inset-0 w-full h-full grid place-content-center" />
        }
      >
        <PrincipalEmployerOrderDetailsSection orderId={orderId} />
      </Suspense>
    </PrincipalEmployerTopbarLayout>
  );
};

export default OrderDetailsPage;
