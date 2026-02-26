import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useUser } from '@/context/UserContext';
import { Clock } from 'lucide-react';
import { generateHash } from '@/actions/contractor/payment';
import { ProductFeedbackPage } from './TakeProductRating';
import { UDF1Type, UDF2Type, UDF3Type } from '@/types/order.types';
import { WorksiteAddressType } from '@/actions/contractor/worksite';
import { shouldSkipPaymentByEmail } from '@/utils/domainUtils';
import { useCart } from '@/context/CartContext';

type OrderSummaryPropsType = {
  selectedWorksite: {
    worksite_id: string;
    address_id: string;
    address: WorksiteAddressType;
  };
  subtotal: number;
  totalGST: number;
  shipping: number;
  total: number;
  maxLeadTime: number;
};

const OrderSummarySection = ({
  selectedWorksite,
  subtotal,
  shipping,
  total,
  totalGST,
  maxLeadTime
}: OrderSummaryPropsType) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { firstName, lastName, email, userId, contactNumber, companyName } =
    useUser();
  const { clearCartItems } = useCart();

  const generateTransactionId = () => {
    return `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  };

  const handlePayment = async () => {
    try {
      setIsProcessing(true);

      if (
        !selectedWorksite.worksite_id ||
        !selectedWorksite.address_id ||
        !selectedWorksite.address.street1
      ) {
        toast.error('Please select a delivery address');
        return;
      }

      if (!userId || !firstName || !lastName || !email) {
        toast.error('User Details not available');
        return;
      }

      const orderDetails: UDF1Type = {
        date: new Date().toISOString(),
        totalAmount: total,
        shippingCharges: shipping
      };

      const userDetails: UDF2Type = {
        userId: userId,
        companyName: companyName ?? ''
      };

      const otherDetails: UDF3Type = {
        address: selectedWorksite.address,
        worksiteId: selectedWorksite.worksite_id
      };

      if (shouldSkipPaymentByEmail(email)) {
        const response = await fetch('/api/place-order-direct', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            orderDetails,
            userDetails: {
              userId: userId,
              firstName,
              lastName,
              email,
              phone: contactNumber ?? '',
              companyName: companyName ?? ''
            },
            otherDetails
          })
        });

        const result = await response.json();

        if (result.success) {
          toast.success('Order placed successfully!');
          await clearCartItems();
        } else {
          toast.error(result.message || 'Failed to place order');
        }
        return;
      }

      const txnId = generateTransactionId();

      const hashResponse = await generateHash({
        txnId: txnId,
        amount: total.toString(),
        productInfo: 'Safezy Products',
        firstName: firstName,
        email: email,
        udf1: JSON.stringify(orderDetails),
        udf2: JSON.stringify(userDetails),
        udf3: JSON.stringify(otherDetails)
      });

      if (!hashResponse.success || !hashResponse.hash) {
        throw new Error('Failed to generate payment hash');
      }

      const form = document.createElement('form');
      form.style.display = 'none';
      form.method = 'POST';
      form.action = process.env.NEXT_PUBLIC_PAYU_BASE_URL!;

      const params = {
        key: process.env.NEXT_PUBLIC_MERCHANT_KEY!,
        txnid: txnId,
        amount: total.toString(),
        productInfo: 'Safezy Products',
        firstname: firstName,
        lastname: lastName,
        email: email,
        phone: contactNumber ?? '',
        address1: selectedWorksite.address.street1,
        address2: selectedWorksite.address.street2 ?? '',
        city: selectedWorksite.address.city,
        state: selectedWorksite.address.state,
        country: selectedWorksite.address.country,
        zipcode: selectedWorksite.address.zipcode,
        surl: `${window.location.origin}/api/payment-success`,
        furl: `${window.location.origin}/api/payment-failure`,
        hash: hashResponse.hash,
        udf1: JSON.stringify(orderDetails),
        udf2: JSON.stringify(userDetails),
        udf3: JSON.stringify(otherDetails)
      };

      Object.entries(params).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      toast.error('Checkout failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="shadow-lg bg-white">
      <CardHeader className="pb-4 bg-gray-50 rounded-t-lg">
        <CardTitle className="text-2xl font-bold text-gray-800">
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {/* Price Breakdown */}
        <div className="space-y-4">
          <div className="flex justify-between text-base">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base">
            <span className="text-gray-600">Total GST</span>
            <span className="font-semibold">₹{totalGST.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base">
            <span className="text-gray-600">Shipping</span>
            <span className="font-semibold">₹{shipping.toFixed(2)}</span>
          </div>
        </div>
        <Separator className="my-4" />
        {/* Total Amount */}
        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
          <span className="text-xl font-bold text-gray-800">Total</span>
          <span className="text-xl font-bold text-primary">
            ₹{total.toFixed(2)}
          </span>
        </div>
        {/* Delivery Information */}
        <div className="space-y-4 mt-6">
          <div className="flex items-center space-x-3 text-gray-700">
            <Clock size={20} className="text-primary" />
            <span>Expected Delivery: {maxLeadTime} Days</span>
          </div>
        </div>
        <div className="mt-6">
          <ProductFeedbackPage
            handlePayment={handlePayment}
            isProcessing={isProcessing}
            disabled={!selectedWorksite.address}
            state={selectedWorksite?.address?.state}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderSummarySection;
