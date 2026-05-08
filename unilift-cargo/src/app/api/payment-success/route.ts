import { NextRequest } from 'next/server';
import { PayUResponse } from '@/types/payment.types';
import { UDF1Type, UDF2Type, UDF3Type } from '@/types/order.types';
import { placeOrder } from '@/actions/contractor/order';
import { createAdminClient } from '@/utils/supabase/server';

const decodeHtmlEntities = (str: string): string => {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'");
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

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

    let orderDetail: UDF1Type | null = null;
    let userDetails: UDF2Type | null = null;
    let otherDetails: UDF3Type | null = null;

    if (payUResponse.udf1 && payUResponse.udf2 && payUResponse.udf3) {
      try {
        orderDetail = JSON.parse(decodeHtmlEntities(payUResponse.udf1)) as UDF1Type;
        userDetails = JSON.parse(decodeHtmlEntities(payUResponse.udf2)) as UDF2Type;
        otherDetails = JSON.parse(decodeHtmlEntities(payUResponse.udf3)) as UDF3Type;
      } catch (error) {
        console.error('Error parsing order details:', error);
      }
    }

    const searchParams = new URLSearchParams();

    if (payUResponse.mihPayId)
      searchParams.append('payment_gateway_transaction_id', payUResponse.mihPayId);
    if (payUResponse.status)
      searchParams.append('transaction_status', payUResponse.status);
    if (payUResponse.PG_TYPE)
      searchParams.append('payment_method', payUResponse.PG_TYPE);
    if (orderDetail?.date) searchParams.append('date', orderDetail.date);
    if (otherDetails?.worksiteId)
      searchParams.append('worksite_id', otherDetails.worksiteId);
    if (orderDetail?.totalAmount !== undefined) {
      searchParams.append('totalAmount', orderDetail.totalAmount.toString());
    } else if (payUResponse.amount) {
      searchParams.append('totalAmount', payUResponse.amount);
    }
    if (payUResponse.txnId)
      searchParams.append('transaction_id', payUResponse.txnId);
    if (payUResponse.error_Message)
      searchParams.append('error_message', payUResponse.error_Message);

    // Place order and record transaction on successful payment
    if (
      payUResponse.status?.toLowerCase() === 'success' &&
      orderDetail &&
      userDetails &&
      otherDetails &&
      userDetails.userId
    ) {
      try {
        const supabase = await createAdminClient();

        const { data: transactionData, error: transactionError } = await supabase
          .from('transaction')
          .insert({
            date: new Date().toISOString(),
            amount: parseFloat(payUResponse.amount),
            user_id: userDetails.userId,
            payment_gateway_transaction_id: payUResponse.mihPayId,
            transaction_status: payUResponse.status,
            payment_mode: payUResponse.payment_source ?? payUResponse.PG_TYPE ?? 'unknown'
          })
          .select('id')
          .single();

        if (!transactionError && transactionData) {
          const contractor = {
            userId: userDetails.userId,
            firstName: payUResponse.firstName,
            lastName: payUResponse.lastName,
            email: payUResponse.email,
            phone: payUResponse.phone,
            companyName: userDetails.companyName
          };

          const orderResult = await placeOrder(orderDetail, contractor, otherDetails);

          if (orderResult.success && orderResult.orderId) {
            await supabase
              .from('order')
              .update({ transaction_id: transactionData.id })
              .eq('id', orderResult.orderId);
          } else {
            console.error('Order placement failed:', orderResult.message);
          }
        } else {
          console.error('Transaction recording error:', transactionError);
        }
      } catch (err) {
        console.error('Error placing order after payment:', err);
      }
    }

    const redirectUrl = `${req.nextUrl.origin}/payment/success`;
    return Response.redirect(`${redirectUrl}?${searchParams.toString()}`, 303);
  } catch (error) {
    console.error('Error handling PayU success URL:', error);
    return Response.redirect(
      `${req.nextUrl.origin}/payment/error?error=processing_failed`,
      303
    );
  }
}
