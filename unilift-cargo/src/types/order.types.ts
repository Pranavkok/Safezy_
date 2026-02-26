import { Database } from './supabase';
import { z } from 'zod';
import { orderSchema } from '@/validations/admin/manage-order';
import { WorksiteAddressType } from '@/actions/contractor/worksite';

export type OrderFormType = z.infer<typeof orderSchema>;

export type OrderListingType = {
  id: string;
  date: string;
  total_amount: number;
  first_name: string | undefined;
  last_name: string | undefined;
  warehouse: string | undefined;
  email: string | undefined;
  total_quantity: number;
  order_status: Database['public']['Enums']['orderStatus'];
};

export type OrderListingContractorType = {
  id: string;
  date: string;
  total_amount: number;
  total_quantity: number;
  order_status: Database['public']['Enums']['orderStatus'];
};

export type OrderItemsListingType = {
  id: number;
  price: number;
  product_id?: string;
  brand_name?: string;
  size?: string;
  color?: string;
  image?: string;
  ppe_category?: string;
  ppe_name?: string;
  quantity: number;
  total_price: number;
};

export interface FetchOrdersByUserParams {
  userId: string;
  searchQuery?: string;
  sortBy: string;
  sortOrder?: string;
  page?: number;
  pageSize?: number;
}

export type FetchOrderParams = {
  worksiteId?: string;
  searchQuery?: string;
  orderStatus?: OrderStatusType;
  paymentStatus?: string | undefined;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  pageSize?: number;
};

export type FetchOrderItemsParams = {
  orderId: string;
  searchQuery?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
};

export type ManageOrderProps = {
  order_status: Database['public']['Enums']['orderStatus'];
  estimated_delivery_date: string | null;
  warehouse_address: string;
  warehouse_operator_id?: string | null;
  store_name: string;
};

export type WarehouseAddressType = {
  id: number;
  warehouse_id: number | null;
  street1: string;
  street2?: string | null;
  locality?: string | null;
  city?: string | null;
  state?: string | null;
  zipcode?: string | null;
  warehouse: {
    store_name: string;
  } | null;
};

export type OrderDataType = {
  order_id: string;
  date: string;
  grand_total: number;
  shipping_charges: number;
  user: {
    first_name?: string;
    last_name?: string;
    company_name?: string | null;
    email?: string;
    contact_number?: string;
  };
  street1?: string;
  locality?: string | null;
  street2?: string | null;
  zipcode?: string;
  city?: string;
  state?: string;
  country?: string;
};

export type OrderDetailsForWarehouseOperatorType = {
  id: string;
  order_status?: Database['public']['Enums']['orderStatus'];
  estimated_delivery_date?: string | null;
  street1?: string;
  street2?: string | null;
  locality?: string | null;
  country?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  first_name?: string;
  last_name?: string;
  company_name?: string | null;
  email?: string;
  contact_number?: string | null;
};

export type OrderDetailsForAdmin = {
  id: string;
  date: string;
  is_email_sent: boolean | null;
  total_amount: number;
  users: {
    first_name: string;
    last_name: string;
    email: string;
    contact_number: string;
  };
  order_items: {
    price: number;
    quantity: number;
    product_color: string | null;
    product_size: string | null;
    product: {
      ppe_name: string;
      ppe_category: string;
      brand_name: string;
    };
  }[];
};

export enum OrderStatus {
  PENDING = 'Pending',
  PROCESSING = 'Processing',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
  CANCELED = 'Cancelled',
  RETURNED = 'Returned',
  COMPLAINT = 'Complaint'
}

export type OrderStatusType =
  | Database['public']['Enums']['orderStatus']
  | undefined;

export type UDF1Type = {
  date: string;
  totalAmount: number;
  shippingCharges: number;
};

export type UDF2Type = {
  userId: string;
  companyName: string;
};
export type UDF3Type = {
  address: WorksiteAddressType;
  worksiteId: string;
};

export type AddOrderType = {
  date: string;
  totalAmount: number;
  shippingCharges: number;
  address: string;
  worksiteId: string;
  userId: string;
  first_name: string;
  last_name: string;
  email: string;
  contact_number: string;
};

export type OrderDelivered = {
  id: string;
  order_status: OrderStatusType;
  is_delivered: boolean | null;
  added_to_inventory: boolean | null;
};

export type UpdateOrderByWarehouseOperator = {
  order_status: OrderStatusType;
  estimated_delivery_date?: string;
  is_delivered?: boolean;
};

// Json Type
export type ContractorJsonType = {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  companyName: string;
};

export type OrderDetailsJsonType = {
  contractor: ContractorJsonType;
  address: WorksiteAddressType;
};

export type ProductDetailsJsonType = {
  id: string;
  ppe_name: string;
  ppe_category: string;
  sub_category: string;
  gst: number;
  hsn_code: string;
  product_ID: string;
};
export type OrderItemDetailsJsonType = {
  product: ProductDetailsJsonType;
};
