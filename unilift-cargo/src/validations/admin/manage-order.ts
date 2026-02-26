import { z } from 'zod';

export const orderSchema = z.object({
  warehouse: z.string().min(1, 'Warehouse is required')
});
