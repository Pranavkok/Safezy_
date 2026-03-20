'use server';

import crypto from 'crypto';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/constants';
import { GenerateHashPropTypes } from '@/types/payment.types';

export const generateHash = async (
  generateHashProps: GenerateHashPropTypes
): Promise<{ success: boolean; message: string; hash?: string }> => {
  try {
    const { txnId, amount, productInfo, firstName, email, udf1, udf2, udf3 } =
      generateHashProps;

    const key = process.env.MERCHANT_KEY;

    if (
      !key ||
      !txnId ||
      !amount ||
      !productInfo ||
      !firstName ||
      !email ||
      !udf1 ||
      !udf2 ||
      !udf3
    ) {
      return {
        success: false,
        message: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS
      };
    }

    const salt = process.env.MERCHANT_SALT;

    if (!salt) {
      console.error('Missing merchant salt in environment variables');
      return {
        success: false,
        message: ERROR_MESSAGES.MERCHANT_SALT_MISSING
      };
    }

    const input = `${key}|${txnId}|${amount}|${productInfo}|${firstName}|${email}|${udf1}|${udf2}|${udf3}||||||||${salt}`;

    const hash = crypto.createHash('sha512').update(input).digest('hex');

    return {
      success: true,
      message: SUCCESS_MESSAGES.HASH_GENERATED,
      hash
    };
  } catch (error) {
    console.error('Error generating hash:', error);
    return {
      success: false,
      message: ERROR_MESSAGES.HASH_NOT_GENERATED
    };
  }
};
