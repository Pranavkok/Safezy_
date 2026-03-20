import { z } from 'zod';

export const AddWarehouseSchema = z.object({
  storeEmail: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
});
