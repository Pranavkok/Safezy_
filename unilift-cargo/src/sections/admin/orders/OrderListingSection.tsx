import React, { Suspense } from 'react';
import { OrderListingTable } from './orders-table/OrderListingTable';
import { SearchParamsType } from '@/types/index.types';
import Spinner from '@/components/loaders/Spinner';
import { fetchAllOrders } from '@/actions/admin/order';
import { OrderStatusType } from '@/types/order.types';

const OrderListingSection = async ({ searchParams }: SearchParamsType) => {
  const searchQuery = searchParams.first_name ?? undefined;
  const sortParam = searchParams.sort ?? undefined;
  const page = parseInt(searchParams.page ?? '1');
  const pageSize = parseInt(searchParams.per_page ?? '10');
  const orderStatus: OrderStatusType =
    searchParams.order_status as OrderStatusType;

  const [sortBy = 'created_at', sortOrder = 'desc'] = sortParam
    ? sortParam.split('.')
    : [];

  const orders = await fetchAllOrders({
    searchQuery,
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
      <OrderListingTable orders={orders} />
    </Suspense>
  );
};

export default OrderListingSection;
