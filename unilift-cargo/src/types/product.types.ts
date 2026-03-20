import {
  AddProductSchema,
  UpdateProductSchema
} from '@/validations/admin/add-update-product';
import { z } from 'zod';

export interface PriceTierProps {
  min_quantity: number;
  max_quantity: number | null;
  price: number;
}

export interface ProductFilters {
  ppeCategory?: string[];
  color?: string;
  rating?: number;
  minPrice?: number;
  maxPrice?: number;
  geographicalLocation: string[];
  brand: string;
  subcategory: string[];
}

export interface SearchProductParams {
  searchQuery: string;
}

export interface Product {
  id: number;
  ppe_category: string;
  ppe_name: string;
  image: string;
  rating: number;
  description: string;
  brand_name: string;
  size: string[];
  color: string;
  use_life: string;
  industry_use: string;
  training_video: string;
  price_tiers: PriceTierProps[];
}

export type addProductWithImageUrlType = Omit<
  z.infer<typeof AddProductSchema>,
  'image'
> & {
  image: string;
};

export type updateProductWithImageUrlType = Omit<
  z.infer<typeof UpdateProductSchema>,
  'image'
> & {
  image: string;
};

export type ProductQueryParams = {
  searchQuery?: string;
  filters?: ProductFilters;
  sortBy?: string;
  page?: number;
  pageSize?: number;
};

export type SortedProductDataType = {
  id: string;
  image: string;
  product_ID: string;
  ppe_name: string;
  brand_name: string;
  price: number;
  ppe_category: string;
  created_at: string;
  is_deleted: boolean;
  total_orders: number;
  order_frequency: number;
  total_count: number;
  avg_rating?: number | null;
  color?: string[] | null;
  description?: string;
  geographical_location?: string[] | null;
  gst?: number | null;
  hsn_code?: string | null;
};

export type SearchResultType = {
  label: string;
  url: string;
};
