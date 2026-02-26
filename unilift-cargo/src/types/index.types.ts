import { Tables } from './supabase';

export type ProductType = Tables<'product'>;

export type OrderType = Tables<'order'>;

export type PriceTiersType = Tables<'price_tiers'>;

export type LeadTimeTiersType = {
  id: string;
  timeInDays: string;
  qtyFrom: string;
  qtyTo: string;
};

export type EmployeeType = Tables<'employee'> & {
  assigned_equipments_count?: number;
};

export type EquipmentType = Tables<'product_inventory'>;

export type EmployeeWithWorksiteType = Tables<'employee'> & {
  worksite: WorksiteType;
};

export type ContractorType = Tables<'users'>;

export type OrderItemsType = Tables<'order_items'>;

export type ProductWithPriceTiersType = ProductType & {
  price_tiers: PriceTiersType[];
};

export type ProductWithPriceAndImagesType = ProductWithPriceTiersType & {
  images: {
    id: number;
    image_url: string;
  }[];
};
export type EquipmentHistory = Tables<'product_history'>;

export type ComplaintType = Tables<'complaint'>;

export type AddressType = Tables<'address'>;

export type WorksiteType = Tables<'worksite'>;

export type EhsNewsType = Tables<'ehs_news'>;

export type ToolboxTalkType = Tables<'ehs_toolbox_talk'>;

export type BlogType = Tables<'blogs'>;

export type ToolboxTalkUserType = Tables<'ehs_toolbox_users'>;

export type ChecklistType = Tables<'ehs_checklist_topics'>;

export type ChecklistQuestionType = Tables<'ehs_checklist_questions'>;
export type ChecklistTopicType = Tables<'ehs_checklist_topics'>;

export type SuggestionType = Tables<'ehs_suggestions'>;

export type IncidentAnalysisType = Tables<'ehs_incident_analysis'>;
export type IncidentAnalysisWithImageType = Tables<'ehs_incident_analysis'> & {
  images: {
    id: number;
    image_url: string;
  }[];
};

export type FirstPrinciplesType = Tables<'ehs_first_principles'>;

export type WorksiteWithAddressType = Tables<'worksite'> & {
  address: [Partial<AddressType>];
};

export type CartItemsType = Tables<'cart_items'>;

export type SearchParamsType = {
  searchParams: Record<string, string | undefined>;
};

export interface SearchPaginationProps {
  searchQuery?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  pageSize?: number;
}
