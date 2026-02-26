export type labelType = {
  id: string;
  value: string;
};

export type AdminContractorOrdersTableColumnType = {
  id: string;
  date: string;
  total_amount: number;
  order_status:
    | 'Out For Delivery'
    | 'Processing'
    | 'Delivered'
    | 'Cancelled'
    | 'Returned'
    | 'Shipped'
    | 'Complaint';
  total_quantity: number;
};
