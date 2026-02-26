export type InvoiceDataType = {
  contractor: {
    firstName: string;
    lastName: string;
    email: string;
    contactNumber: string;
  };

  order: {
    id: string;
    date: string;
    shippingCharges: number;
    address: string;
    orderItems: {
      quantity: number;
      price: number;
      color: string;
      size: string;
      product: {
        id: string;
        ppeName: string;
        gst: number | null;
        hsnCode: string | null;
        productId: string | null;
      };
    }[];
    transaction: {
      paymentMode: string;
      tnxId: string;
    };
  };
};
