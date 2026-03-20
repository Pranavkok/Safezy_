'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';
import { notFound } from 'next/navigation';
import { AppRoutes } from '@/constants/AppRoutes';
import Link from 'next/link';
import {
  fetchOrderDetailsForAdmin,
  fetchOrderIdFromTransactionId
} from '@/actions/contractor/order';
import { sendOrderDetailsToAdmin } from '@/actions/email';

type StatusType = 'success' | 'failure' | 'pending' | 'error';

interface StatusConfig {
  icon: React.ElementType;
  title: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface SearchParams {
  worksite_id?: string;
  orderId?: string;
  amount?: string;
  txnid?: string;
  message?: string;
  payment_gateway_transaction_id?: string;
  transaction_status?: string;
  date?: string;
  totalAmount?: string;
  transaction_id?: string;
  error_message?: string;
  payment_method?: string;
}

interface PaymentStatusPageProps {
  params: {
    status: StatusType;
  };
  searchParams: SearchParams;
}
// export function generateStaticParams() {
//   return ['success', 'failure', 'pending', 'error'].map(status => ({
//     status
//   }));
// }

const statusConfig: Record<StatusType, StatusConfig> = {
  success: {
    icon: CheckCircle2,
    title: 'Payment Successful',
    color: 'text-primary',
    bgColor: 'bg-primary/5',
    borderColor: 'border-primary/20'
  },
  failure: {
    icon: XCircle,
    title: 'Payment Failed',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  pending: {
    icon: Clock,
    title: 'Payment Pending',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  error: {
    icon: AlertCircle,
    title: 'Payment Error',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  }
};

const getDefaultMessage = (status: StatusType): string => {
  const messages: Record<StatusType, string> = {
    success:
      'Thank you for your purchase! Your payment was successfully processed.',
    failure: "We couldn't process your payment. Please try again.",
    pending:
      "Your payment is being processed. We'll update you once it's confirmed.",
    error: 'An error occurred while processing your payment.'
  };
  return messages[status];
};

const PaymentStatusPage: React.FC<PaymentStatusPageProps> = ({
  params,
  searchParams
}) => {
  const { status } = params;
  const {
    payment_method,
    amount,
    txnid,
    message,
    payment_gateway_transaction_id,
    transaction_status,
    date,
    totalAmount,
    transaction_id,
    error_message,
    worksite_id
  } = searchParams;

  useEffect(() => {
    const fetchData = async () => {
      const orderId = await fetchOrderIdFromTransactionId(
        payment_gateway_transaction_id as string
      );
      const orderData = await fetchOrderDetailsForAdmin(orderId.data as string);

      if (
        orderData?.data?.length &&
        orderData.data[0].is_email_sent === false
      ) {
        await sendOrderDetailsToAdmin(orderData.data[0]);
      }
    };

    fetchData();
  }, []);

  if (!Object.keys(statusConfig).includes(status)) {
    return notFound();
  }

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const displayAmount = totalAmount || amount;
  const displayTxnId = transaction_id || txnid;
  const formattedDate = date ? new Date(date).toLocaleString() : null;

  return (
    <div className="flex flex-col gap-6 justify-center items-center px-4 sm:px-6 py-8">
      <div className="bg-white w-full sm:w-[90%] md:w-[70%] lg:w-[35%] border border-[#e7e3e3] rounded-lg shadow-sm">
        <div className={`p-6 sm:p-10 flex flex-col items-center`}>
          <div className={`${config.bgColor} p-4 rounded-full`}>
            <StatusIcon
              className={`h-12 w-12 sm:h-16 sm:w-16 ${config.color}`}
            />
          </div>

          <h1
            className={`font-inter text-lg sm:text-[26px] font-semibold mt-4 sm:mt-6 ${config.color}`}
          >
            {config.title}
          </h1>

          <p className="font-inter text-sm sm:text-[20px] font-medium text-gray-600 text-center mt-2 sm:mt-4">
            {message ||
              (error_message !== 'No Error' && error_message) ||
              getDefaultMessage(status)}
          </p>

          {(displayTxnId ||
            displayAmount ||
            payment_gateway_transaction_id ||
            formattedDate) && (
            <div className="w-full mt-6 sm:mt-8 space-y-4 bg-gray-50/50 rounded-lg p-4 sm:p-6">
              <h2 className="text-base text-center sm:text-left sm:text-lg font-semibold text-gray-800">
                Transaction Details
              </h2>
              <div className="space-y-3">
                {displayTxnId && (
                  <div className="flex flex-col sm:flex-row justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600">
                      Transaction ID
                    </span>
                    <p className="text-sm sm:text-base font-medium text-gray-800 break-all">
                      {displayTxnId}
                    </p>
                  </div>
                )}
                {payment_gateway_transaction_id && (
                  <div className="flex flex-col sm:flex-row justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600">
                      Gateway Transaction ID
                    </span>
                    <p className="text-sm sm:text-base font-medium text-gray-800 break-all">
                      {payment_gateway_transaction_id}
                    </p>
                  </div>
                )}
                {transaction_status && (
                  <div className="flex flex-col sm:flex-row justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600">
                      Status
                    </span>
                    <span className="text-sm sm:text-base font-medium capitalize text-gray-800">
                      {transaction_status}
                    </span>
                  </div>
                )}
                {payment_method && (
                  <div className="flex flex-col sm:flex-row justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600">
                      Payment Method
                    </span>
                    <span className="text-sm sm:text-base font-medium capitalize text-gray-800">
                      {payment_method}
                    </span>
                  </div>
                )}
                {displayAmount && (
                  <div className="flex flex-col sm:flex-row justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600">
                      Amount
                    </span>
                    <span className="text-sm sm:text-base font-medium text-gray-800">
                      ₹{parseFloat(displayAmount).toLocaleString()}
                    </span>
                  </div>
                )}
                {formattedDate && (
                  <div className="flex flex-col sm:flex-row justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600">
                      Date
                    </span>
                    <span className="text-sm sm:text-base font-medium text-gray-800">
                      {formattedDate}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 w-full mt-6 sm:mt-8">
            {status === 'success' && (
              <Link
                href={`${AppRoutes.CONTRACTOR_ORDER_LISTING}?worksite=${worksite_id}`}
                className="w-full h-[40px] bg-white border border-gray-200 text-gray-700 font-semibold rounded-md hover:bg-gray-50 transition-colors flex justify-center items-center"
              >
                View Orders
              </Link>
            )}
            {status === 'failure' && (
              <Link
                href={`${AppRoutes.CONTRACTOR_CART}`}
                className="w-full h-[40px] bg-white border border-gray-200 text-gray-700 font-semibold rounded-md hover:bg-gray-50 transition-colors flex justify-center items-center"
              >
                Return to Cart
              </Link>
            )}

            <Link
              href={AppRoutes.PRODUCT_LISTING}
              className="w-full h-[40px] bg-black flex justify-center items-center text-white font-semibold rounded-md hover:bg-gray-800 transition-colors"
            >
              Return to Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusPage;
