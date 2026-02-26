import { NextRequest } from 'next/server';
import { PayUResponse } from '@/types/payment.types';
import { UDF1Type } from '@/types/order.types';

/**
 * Decodes HTML entities from a string
 */
const decodeHtmlEntities = (str: string): string => {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'");
};

/**
 * Handles PayU failure URL (furl) redirect
 * This receives data when the user is redirected back from PayU after a failed payment
 */
export async function POST(req: NextRequest) {
  try {
    // Parse the form data from the request
    const formData = await req.formData();

    // Create the PayU response object from failure URL parameters
    const payUResponse: PayUResponse = {
      key: (formData.get('key') as string) || '',
      txnId: (formData.get('txnid') as string) || '',
      amount: (formData.get('amount') as string) || '',
      productInfo: (formData.get('productinfo') as string) || '',
      firstName: (formData.get('firstname') as string) || '',
      lastName: (formData.get('lastname') as string) || '',
      phone: (formData.get('phone') as string) || '',
      email: (formData.get('email') as string) || '',
      mihPayId: (formData.get('mihpayid') as string) || '',
      status: (formData.get('status') as string) || 'failed', // Default to failed status for furl
      hash: (formData.get('hash') as string) || '',
      bank_ref_num: (formData.get('bank_ref_num') as string) || undefined,
      payment_source: (formData.get('payment_source') as string) || undefined,
      error_Message: (formData.get('error_Message') as string) || undefined,
      PG_TYPE: (formData.get('PG_TYPE') as string) || undefined,
      bank_code: (formData.get('bank_code') as string) || undefined,
      cardNum: (formData.get('cardnum') as string) || undefined,
      name_on_card: (formData.get('name_on_card') as string) || undefined,
      udf1: (formData.get('udf1') as string) || undefined,
      udf2: (formData.get('udf2') as string) || undefined
    };

    // Parse order details from udf1 if available
    let orderDetail = null;
    if (payUResponse.udf1) {
      try {
        const decodedUdf1 = decodeHtmlEntities(payUResponse.udf1);

        orderDetail = JSON.parse(decodedUdf1) as UDF1Type;
      } catch (error) {
        console.error('Error parsing order details:', error);
        // Continue with the redirect even if parsing fails
      }
    }

    // Create URL parameters for the redirect
    const searchParams = new URLSearchParams();

    // Add essential transaction details to the URL
    if (payUResponse.txnId)
      searchParams.append('transaction_id', payUResponse.txnId);
    if (payUResponse.mihPayId)
      searchParams.append(
        'payment_gateway_transaction_id',
        payUResponse.mihPayId
      );
    searchParams.append('transaction_status', payUResponse.status);

    // Add order details if available
    if (orderDetail?.date) searchParams.append('date', orderDetail.date);
    if (orderDetail?.totalAmount !== undefined) {
      searchParams.append('totalAmount', orderDetail.totalAmount.toString());
    } else if (payUResponse.amount) {
      searchParams.append('totalAmount', payUResponse.amount);
    }

    // Add error details (important for failure page)
    if (payUResponse.error_Message) {
      searchParams.append('error_message', payUResponse.error_Message);
    } else {
      searchParams.append(
        'error_message',
        'Payment failed or was cancelled by the user'
      );
    }

    // Add payment method information if available
    if (payUResponse.payment_source)
      searchParams.append('payment_method', payUResponse.payment_source);
    if (payUResponse.bank_code)
      searchParams.append('bank_code', payUResponse.bank_code);

    // Redirect to the failure page with all details
    return Response.redirect(
      `${req.nextUrl.origin}/payment/failure?${searchParams.toString()}`,
      303
    );
  } catch (error) {
    console.error('Error handling PayU failure URL:', error);

    // Redirect to generic error page if processing fails
    return Response.redirect(
      `${req.nextUrl.origin}/payment/error?error=processing_failed&message=Unable+to+process+payment+response`,
      303
    );
  }
}
