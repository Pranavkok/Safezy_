import { Json } from './supabase';

export type EquipmentListingType = {
  id: string;
  last_assigned_date: string | null;
  history: Json;
  product_status: string | null;
  name: string;
};

export type OrderedProductType = {
  id: string;
  product_id: string | null;
  name: string | null;
  quantity: number | null;
  assigned: number | null;
  totalQuantity: number;
};

export type OrderedProductDetailsType = {
  id: number;
  expirationDate: string;
  employeeName: string;
  assignedDate: string;
  status: string;
};

export type OrderedProductDetailsModalType = {
  id: number;
  assignedDate: string;
  unassignedDate: string | null;
  employeeName: string;
  productName: string;
  status: string;
  expirationDate: string;
  remainingLife: number;
};

export type ProductHistoryType = {
  id: number;
  assigned_date: string;
  unassigned_date: string | null;
  employee: {
    name: string;
  } | null;
  product_inventory: {
    product_name: string;
    product: {
      use_life: number;
    } | null;
  } | null;
};

export type SafetyItem = {
  id: string;
  name: string;
  availability: number;
};

export type WorksiteAddressType = {
  street1: string;
  street2: string;
  locality: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
};

export type Worksite = {
  id: string;
  name: string;
  location: string;
  safetyItems: SafetyItem[];
};
