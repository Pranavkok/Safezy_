import OrderDetailsCard from '@/components/common/OrderDetailsCard';
import React, { Suspense } from 'react';
import { OrderDetailsTable } from './orders-table/OrderDetailsTable';
import {
  fetchOrderBasicDetails,
  fetchOrderItems
} from '@/actions/contractor/order';
import Spinner from '@/components/loaders/Spinner';
import { formattedDate } from '@/lib';
import { notFound } from 'next/navigation';

const ContractorOrderDetailsSection = async ({
  orderId
}: {
  orderId: string;
}) => {
  const [{ data: orderDetails }, orderItems] = await Promise.all([
    fetchOrderBasicDetails(orderId),
    fetchOrderItems({ orderId })
  ]);

  if (!orderDetails) {
    notFound();
  }

  const {
    user: { first_name, last_name, company_name, email, contact_number },
    grand_total,
    shipping_charges,
    street1,
    locality,
    city,
    state,
    zipcode,
    date,
    estimated_delivery_date,
    order_status
  } = orderDetails;

  const payableAmount = (grand_total + shipping_charges + 30).toFixed(2);

  return (
    <>
      <div className="uppercase flex flex-col 2xl:flex-row  gap-5 items-center justify-between mb-5  font-bold">
        <div className="flex  flex-col sm:flex-row sm:gap-2 ">
          <p>Order Number:</p>
          <p className="text-primary">#{orderId}</p>
        </div>
      </div>

      <div className="grid space-y-5 lg:space-y-0 xl:grid-cols-2 xl:gap-y-4 2xl:grid-cols-3 lg:gap-x-12">
        {/* User Details */}
        <div>
          <OrderDetailsCard
            details={[
              {
                value: `${first_name ?? 'N/A'} ${last_name ?? 'N/A'}`,
                label: 'Name'
              },
              { value: company_name ?? 'N/A', label: 'Company Name' },
              { value: email ?? 'N/A', label: 'Email' },
              { value: contact_number ?? 'N/A', label: 'Contact Number' }
            ]}
          />
          <div className="bg-primary font-bold text-black flex justify-between items-center py-2 px-5 rounded mt-3 h-12">
            <p>Payment Status</p>
            <p>Paid</p>
          </div>
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
          <div className="bg-primary font-bold text-black flex justify-between items-center py-2 px-5 rounded mt-3 h-12">
            <p>Order Status</p>
            <p className="border-2 border-white py-1 px-4 rounded bg-white">
              {order_status}
            </p>
          </div>
          {estimated_delivery_date && (
            <div className="bg-primary font -bold text-black flex justify-between items-center py-2 px-5 rounded mt-3 h-12">
              <p>Expected Delivery Date</p>
              <p className="border-2 border-white py-1 px-4 rounded bg-white">
                {estimated_delivery_date}
              </p>
            </div>
          )}
        </div>

        <div>
          <OrderDetailsCard
            details={[
              { value: formattedDate(date), label: 'Order Created Date' },
              { value: `₹${grand_total.toFixed(2)}`, label: 'Grand Total' },
              { value: '₹30', label: 'GST & other Taxes' },
              {
                value: `₹${shipping_charges.toFixed(2)}`,
                label: 'Delivery Charges'
              }
            ]}
          />
          <div className="bg-primary font-bold text-black flex justify-between items-center py-2 px-5 rounded mt-3 h-12">
            <p>Payable Amount</p>
            <p>₹{payableAmount}</p>
          </div>
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

export default ContractorOrderDetailsSection;
