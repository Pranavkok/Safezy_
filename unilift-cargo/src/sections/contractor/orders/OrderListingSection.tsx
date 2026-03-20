import { OrderListingTable } from './orders-table/OrderListingTable';
import { fetchAllOrdersByContractor } from '@/actions/contractor/order';
import { SearchParamsType } from '@/types/index.types';
import { OrderStatusType } from '@/types/order.types';

const ContractorOrderListingSection = async ({
  searchParams
}: SearchParamsType) => {
  const sortParam = searchParams?.sort ?? undefined;
  const page = parseInt(searchParams?.page ?? '1', 10);
  const pageSize = parseInt(searchParams?.per_page ?? '10', 10);
  const [sortBy = 'created_at', sortOrder = 'desc'] = sortParam
    ? sortParam.split('.')
    : [];
  const orderStatus: OrderStatusType =
    (searchParams?.order_status as OrderStatusType) ?? undefined;
  const worksiteId = searchParams?.worksite as string;

  const orders = await fetchAllOrdersByContractor({
    worksiteId,
    orderStatus,
    sortBy,
    sortOrder,
    page,
    pageSize
  });

  return <>{worksiteId && <OrderListingTable orders={orders} />}</>;
};

export default ContractorOrderListingSection;
