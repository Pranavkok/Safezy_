import { NextRequest } from 'next/server';
import { PayUResponse } from '@/types/payment.types';
import { UDF1Type, UDF3Type } from '@/types/order.types';

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
 * Handles PayU success URL (surl) redirect
 * This receives data when the user is redirected back from PayU after payment
 */
export async function POST(req: NextRequest) {
  try {
    // Parse the form data from the request
    const formData = await req.formData();

    // Create the PayU response object from success URL parameters
    const payUResponse: PayUResponse = {
      key: (formData.get('key') as string) || '',
      txnId: (formData.get('txnid') as string) || '',
      amount: (formData.get('amount') as string) || '',
      productInfo: (formData.get('productinfo') as string) || '',
      firstName: (formData.get('firstname') as string) || '',
      lastName: (formData.get('lastname') as string) || '',
      email: (formData.get('email') as string) || '',
      phone: (formData.get('phone') as string) || '',
      mihPayId: (formData.get('mihpayid') as string) || '',
      status: (formData.get('status') as string) || '',
      hash: (formData.get('hash') as string) || '',
      bank_ref_num: (formData.get('bank_ref_num') as string) || undefined,
      payment_source: (formData.get('payment_source') as string) || undefined,
      error_Message: (formData.get('error_Message') as string) || undefined,
      PG_TYPE: (formData.get('PG_TYPE') as string) || undefined,
      bank_code: (formData.get('bank_code') as string) || undefined,
      cardNum: (formData.get('cardnum') as string) || undefined,
      name_on_card: (formData.get('name_on_card') as string) || undefined,
      udf1: (formData.get('udf1') as string) || undefined,
      udf2: (formData.get('udf2') as string) || undefined,
      udf3: (formData.get('udf3') as string) || undefined
    };

    // Parse order details from udf1 if available
    let orderDetail = null;
    let otherDetails = null;
    if (payUResponse.udf1 && payUResponse.udf3) {
      try {
        const decodedUdf1 = decodeHtmlEntities(payUResponse.udf1);
        const decodedUdf3 = decodeHtmlEntities(payUResponse.udf3);

        orderDetail = JSON.parse(decodedUdf1) as UDF1Type;
        otherDetails = JSON.parse(decodedUdf3) as UDF3Type;
      } catch (error) {
        console.error('Error parsing order details:', error);
        // Continue with the redirect even if parsing fails
      }
    }

    // Create URL parameters for the redirect
    const searchParams = new URLSearchParams();

    // Add essential transaction details to the URL
    if (payUResponse.mihPayId)
      searchParams.append(
        'payment_gateway_transaction_id',
        payUResponse.mihPayId
      );
    if (payUResponse.status)
      searchParams.append('transaction_status', payUResponse.status);

    // Add payment method information if available
    if (payUResponse.PG_TYPE)
      searchParams.append('payment_method', payUResponse.PG_TYPE);

    // Add order details if available
    if (orderDetail?.date) searchParams.append('date', orderDetail.date);
    if (otherDetails?.worksiteId)
      searchParams.append('worksite_id', otherDetails.worksiteId);
    if (orderDetail?.totalAmount !== undefined) {
      searchParams.append('totalAmount', orderDetail.totalAmount.toString());
    } else if (payUResponse.amount) {
      searchParams.append('totalAmount', payUResponse.amount);
    }

    // Add transaction ID
    if (payUResponse.txnId)
      searchParams.append('transaction_id', payUResponse.txnId);

    // Add any error message if present
    if (payUResponse.error_Message)
      searchParams.append('error_message', payUResponse.error_Message);

    // Determine the redirect URL based on payment status
    const redirectUrl = `${req.nextUrl.origin}/payment/success`;

    // Redirect with all the transaction details
    return Response.redirect(`${redirectUrl}?${searchParams.toString()}`, 303);
  } catch (error) {
    console.error('Error handling PayU success URL:', error);

    // Redirect to error page if processing fails
    return Response.redirect(
      `${req.nextUrl.origin}/payment/error?error=processing_failed`,
      303
    );
  }
}
