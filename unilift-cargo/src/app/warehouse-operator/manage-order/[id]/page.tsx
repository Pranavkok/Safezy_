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

  const { success, data: orderDetails, message } =
    await fetchOrderDetailsForWarehouseOperator(orderId);

  if (!success) {
    return (
      <WarehouseOperatorDashboardLayout title="Dashboard">
        <div className="flex flex-col items-center justify-center h-[50vh] gap-3">
          <p className="text-xl font-semibold text-gray-600">Order Not Found</p>
          <p className="text-sm text-gray-400">{message}</p>
        </div>
      </WarehouseOperatorDashboardLayout>
    );
  }

  return (
    <WarehouseOperatorDashboardLayout title="Dashboard">
      <ManageOrderSection orderId={orderId} orderDetails={orderDetails} />
    </WarehouseOperatorDashboardLayout>
  );
};

export default ManageOrderByWarehouse;
