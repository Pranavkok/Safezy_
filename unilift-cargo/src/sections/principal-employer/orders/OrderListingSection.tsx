import React, { Suspense } from 'react';
import { OrderListingTable } from './orders-table/OrderListingTable';
import { SearchParamsType } from '@/types/index.types';
import Spinner from '@/components/loaders/Spinner';
import { fetchAllOrdersByContractorPUser } from '@/actions/principal-employer/principal';
import { OrderStatusType } from '@/types/order.types';

const PrincipalEmployerOrderListingSection = async ({
  searchParams
}: SearchParamsType) => {
  const uniqueCode = searchParams?.uniqueCode as string;
  const sortParam = searchParams?.sort || undefined;
  const page = parseInt(searchParams?.page || '1', 10);
  const pageSize = parseInt(searchParams?.per_page || '10', 10);
  const [sortBy = 'date', sortOrder = 'asc'] = sortParam
    ? sortParam.split('.')
    : [];
  const orderStatus: OrderStatusType =
    (searchParams?.order_status as OrderStatusType) || undefined;

  const orderListing = await fetchAllOrdersByContractorPUser({
    uniqueCode,
    orderStatus,
    sortBy,
    sortOrder,
    page,
    pageSize
  });

  return (
    <Suspense
      fallback={
        <Spinner className="absolute inset-0 w-full h-full grid place-content-center" />
      }
    >
      <OrderListingTable orderListing={orderListing} />
    </Suspense>
  );
};

export default PrincipalEmployerOrderListingSection;
