import {
  AddEmployeeSchema,
  UpdateEmployeeSchema
} from '@/validations/contractor/add-employee';
import { z } from 'zod';

export type AddEmployeeType = z.infer<typeof AddEmployeeSchema>;

export type UpdateEmployeeType = z.infer<typeof UpdateEmployeeSchema>;

export type UpdateEmployeeModalType = {
  contact_number: string | null;
  created_at: string;
  email: string | null;
  id: string;
  site_manager: string | null;
  site_name: string;
  unique_code: string | null;
  user_id: string | null;
  street1: string;
  street2: string | null;
  locality: string | null;
  city: string;
  state: string;
  country: string;
  zipcode: string;
};

export type EmployeeEquipmentHistory = {
  id: number;
  assigned_date: string;
  unassigned_date: string | null;
  quantity: number;
  expiration_date: string;
  product_name?: string | null;
  remaining_life: number;
  renewal_date: string;
};

export interface EmployeePPEHistoryType {
  employeeId: number | null;
  employeeName: string | null;
  status: Record<
    string,
    { state: 'Assigned' | 'Not Assigned'; date?: string }
  > | null;
  assignedDate?: string | null;
  unassignedDate?: string | null;
}
