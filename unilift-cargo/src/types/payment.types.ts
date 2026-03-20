export type GenerateHashPropTypes = {
  txnId: string;
  amount: string;
  productInfo: string;
  firstName: string;
  email: string;
  udf1: string;
  udf2: string;
  udf3: string;
};

export type PayUResponse = {
  key: string;
  txnId: string;
  amount: string;
  productInfo: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  mihPayId: string;
  status: string;
  hash: string;
  bank_ref_num?: string;
  payment_source?: string;
  error_Message?: string;
  PG_TYPE?: string;
  bank_code?: string;
  cardNum?: string;
  name_on_card?: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
};

export type PaymentResult = {
  status: 'success' | 'failure' | 'pending' | 'error';
  data: {
    orderId?: string;
    message: string;
    error?: string;
  };
};
