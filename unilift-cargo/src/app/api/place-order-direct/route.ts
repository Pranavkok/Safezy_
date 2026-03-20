'use server';

import { NextRequest, NextResponse } from 'next/server';
import { placeOrder } from '@/actions/contractor/order';
import { createAdminClient } from '@/utils/supabase/server';
import { shouldSkipPaymentByEmail } from '@/utils/domainUtils';
import { UDF1Type, UDF3Type } from '@/types/order.types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderDetails, userDetails, otherDetails } = body;

    // Check if payment should be skipped for this email domain
    if (!shouldSkipPaymentByEmail(userDetails.email)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Direct order placement is not allowed for this email domain'
        },
        { status: 403 }
      );
    }

    // Validate required fields
    if (!orderDetails || !userDetails || !otherDetails) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required order information'
        },
        { status: 400 }
      );
    }

    // Validate user details
    if (!userDetails.userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid user information'
        },
        { status: 400 }
      );
    }

    // Create a mock transaction record for tracking purposes
    const supabase = await createAdminClient();
    const mockTransactionDetails = {
      date: new Date(Date.now()).toISOString(),
      amount: orderDetails.totalAmount,
      user_id: userDetails?.userId,
      payment_gateway_transaction_id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      transaction_status: 'success',
      payment_mode: 'direct_order'
    };

    const { data: transactionData, error: transactionError } = await supabase
      .from('transaction')
      .insert(mockTransactionDetails)
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

    const contractor = {
      userId: userDetails.userId,
      firstName: userDetails.firstName,
      lastName: userDetails.lastName,
      email: userDetails.email,
      phone: userDetails.phone,
      companyName: userDetails.companyName
    };

    // Place the order directly
    const orderResult = await placeOrder(
      orderDetails as UDF1Type,
      contractor,
      otherDetails as UDF3Type
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
      console.error('Error updating order with transaction ID:', updateError);
      // Don't fail the response, just log the error
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Order placed successfully without payment'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Direct order placement error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error during order placement',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
