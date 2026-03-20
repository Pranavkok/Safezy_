import { OrderStatusType } from './order.types';

export type FetchOrderParamsPUser = {
  uniqueCode: string;
  searchQuery?: string;
  orderStatus?: OrderStatusType;
  paymentStatus?: string | undefined;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  pageSize?: number;
};

export type WorksiteIDFromUniqueCodeType = {
  worksiteId: string;
  userId: string;
};
