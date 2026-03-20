import React, { Suspense } from 'react';
import Spinner from '@/components/loaders/Spinner';
import { OrderDetailsTable } from '../../admin/orders/orders-table/OrderDetailsTable';
import OrderDetailsCard from '@/components/common/OrderDetailsCard';
import { fetchOrderItems } from '@/actions/contractor/order';
import UpdateOrderStatusSection from './UpdateOrderStatusSection';
import { OrderDetailsForWarehouseOperatorType } from '@/types/order.types';

const ManageOrderSection = async ({
  orderId,
  orderDetails
}: {
  orderId: string;
  orderDetails: OrderDetailsForWarehouseOperatorType;
}) => {
  const orderItems = await fetchOrderItems({ orderId });

  const {
    city,
    company_name,
    contact_number,
    email,
    estimated_delivery_date,
    first_name,
    last_name,
    locality,
    order_status,
    street1,
    state,
    zipcode
  } = orderDetails;

  return (
    <>
      <div className="flex gap-2 mb-5">
        <p>Order Number:</p>
        <p className="text-primary">#{orderId}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-5 gap-x-10">
        <div>
          <OrderDetailsCard
            details={[
              {
                value: `${first_name ?? 'N/A'} ${last_name ?? ''}`,
                label: 'Name'
              },
              { value: company_name ?? 'N/A', label: 'Company Name' },
              { value: email ?? 'N/A', label: 'Email' },
              { value: contact_number ?? 'N/A', label: 'Contact Number' }
            ]}
          />
        </div>
        <div>
          <OrderDetailsCard
            details={[
              { value: street1 ?? 'N/A', label: 'Street Address' },
              {
                value:
                  locality || city
                    ? `${locality ? locality : ''}${locality && city ? ', ' : ''}${city ? city : ''}`
                    : 'N/A',
                label: 'Locality & City'
              },
              { value: state ?? 'N/A', label: 'State' },
              { value: zipcode ?? 'N/A', label: 'Postcode' }
            ]}
          />
        </div>

        <div className="lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-3 h-full">
          <UpdateOrderStatusSection
            orderId={orderId}
            estimatedDeliveryDate={estimated_delivery_date as string}
            orderStatus={order_status}
            isDelivered={order_status === 'Delivered'}
          />
        </div>
      </div>

      <div className="mt-5 relative">
        <p className="uppercase font-bold">Total Orders:</p>
        <Suspense
          fallback={
            <Spinner className="absolute inset-0 w-full h-full grid place-content-center" />
          }
        >
          <OrderDetailsTable orderItems={orderItems} />
        </Suspense>
      </div>
    </>
  );
};

export default ManageOrderSection;
