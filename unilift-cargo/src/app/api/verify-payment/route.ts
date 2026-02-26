'use server';

import crypto from 'crypto';
import { placeOrder } from '@/actions/contractor/order';
import { createAdminClient } from '@/utils/supabase/server';
import { NextResponse, NextRequest } from 'next/server';
import { PayUResponse } from '@/types/payment.types';
import { UDF1Type, UDF2Type, UDF3Type } from '@/types/order.types';

const decodeHtmlEntities = (str: string): string => {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'");
};

const verifyPaymentHash = (
  payUResponse: PayUResponse,
  key: string,
  salt: string
) => {
  const { status } = payUResponse;
  const hashString = `${salt}|${status}||||||||${payUResponse.udf3}|${payUResponse.udf2}|${payUResponse.udf1}|${payUResponse.email}|${payUResponse.firstName}|${
    payUResponse.productInfo
  }|${payUResponse.amount}|${payUResponse.txnId}|${key}`;

  return crypto.createHash('sha512').update(hashString).digest('hex');
};

export async function POST(request: NextRequest) {
  try {
    // Get merchant credentials from environment variables
    const key = process.env.MERCHANT_KEY;
    const salt = process.env.MERCHANT_SALT;

    if (!key || !salt) {
      console.error('Missing PayU merchant credentials');
      return NextResponse.json(
        {
          success: false,
          data: {
            message: 'Server configuration error: Missing merchant credentials'
          }
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();

    const payUResponse: PayUResponse = {
      key: formData.get('key') as string,
      txnId: formData.get('txnid') as string,
      amount: formData.get('amount') as string,
      productInfo: formData.get('productinfo') as string,
      firstName: formData.get('firstname') as string,
      lastName: formData.get('lastname') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      mihPayId: formData.get('mihpayid') as string,
      status: formData.get('status') as string,
      hash: formData.get('hash') as string,
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

    const calculatedHash = verifyPaymentHash(payUResponse, key, salt);

    if (calculatedHash !== payUResponse.hash) {
      console.error('Hash mismatch!');
      return NextResponse.json(
        {
          success: false,
          message: 'Payment verification failed: Invalid hash'
        },
        { status: 400 }
      );
    }

    const {
      mihPayId,
      status,
      firstName,
      lastName,
      email,
      phone,
      amount,
      error_Message,
      payment_source,
      PG_TYPE,
      udf1,
      udf2,
      udf3
    } = payUResponse;

    const decodedUdf1 = udf1 ? decodeHtmlEntities(udf1) : '';
    const decodedUdf2 = udf2 ? decodeHtmlEntities(udf2) : '';
    const decodedUdf3 = udf3 ? decodeHtmlEntities(udf3) : '';

    const orderDetails: UDF1Type = JSON.parse(decodedUdf1);

    const userDetails = JSON.parse(decodedUdf2) as UDF2Type;
    const otherDetails: UDF3Type = JSON.parse(decodedUdf3);

    if (!userDetails.userId) {
      console.error('Invalid or missing order details in udf1');

      return NextResponse.json(
        {
          success: false,
          message: 'Invalid or missing order details'
        },
        { status: 400 }
      );
    }

    const transactionDetails = {
      date: new Date(Date.now()).toISOString(),
      amount: parseFloat(amount),
      user_id: userDetails?.userId,
      payment_gateway_transaction_id: mihPayId,
      transaction_status: status,
      payment_mode: payment_source ?? PG_TYPE ?? 'unknown'
    };

    const supabase = await createAdminClient();

    const { data: transactionData, error: transactionError } = await supabase
      .from('transaction')
      .insert(transactionDetails)
      .select('id')
      .single();

    if (transactionError) {
      console.error('Transaction recording error:', transactionError);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to record transaction'
        },
        { status: 400 }
      );
    }

    const transactionId = transactionData.id;

    switch (status.toLowerCase()) {
      case 'success': {
        const contractor = {
          userId: userDetails.userId,
          firstName,
          lastName,
          email,
          phone,
          companyName: userDetails.companyName
        };

        const orderResult = await placeOrder(
          orderDetails,
          contractor,
          otherDetails
        );

        if (!orderResult.success) {
          return NextResponse.json(
            {
              success: false,
              message: orderResult.message
            },
            { status: 400 }
          );
        }

        const { error: updateError } = await supabase
          .from('order')
          .update({ transaction_id: transactionId })
          .eq('id', orderResult.orderId as string);

        if (updateError) {
          console.error(
            'Error updating order with transaction ID:',
            updateError
          );
          // Don't fail the webhook response, just log the error
        }
        return NextResponse.json(
          {
            success: true,
            message: 'Payment completed successfully and order placed'
          },
          { status: 200 }
        );
      }

      case 'failure':
        return NextResponse.json(
          {
            success: false,
            message: error_Message ?? 'Payment failed'
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Payment verification error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error during payment verification',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 400 }
    );
  }
}
