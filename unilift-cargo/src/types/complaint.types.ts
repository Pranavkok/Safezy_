import { AddComplaintSchema } from '@/validations/contractor/add-complaint';
import { z } from 'zod';

export type addComplaintType = z.infer<typeof AddComplaintSchema>;

export type ComplaintListingType = {
  id: number;
  image: string | null;
  description: string;
  first_name?: string;
  last_name?: string;
  email: string;
  company_name?: string | null;
  contact_number: string;
  order_id: string | null;
};

export type ComplaintModalType = {
  image: string;
  description: string;
};

export interface GetComplaintsParamsType {
  searchQuery?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  pageSize?: number;
}
