import { fetchOrderDetailsForWarehouseOperator } from '@/actions/contractor/order';
import WarehouseOperatorDashboardLayout from '@/layouts/WarehouseOperatorDashboardLayout';
import ManageOrderSection from '@/sections/warehouse-operator/manage-order/ManageOrderSection';
import { notFound } from 'next/navigation';

const ManageOrderByWarehouse = async ({
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

  const { data: orderDetails } =
    await fetchOrderDetailsForWarehouseOperator(orderId);

  return (
    <WarehouseOperatorDashboardLayout title="Dashboard">
      <ManageOrderSection orderId={orderId} orderDetails={orderDetails} />
    </WarehouseOperatorDashboardLayout>
  );
};

export default ManageOrderByWarehouse;
