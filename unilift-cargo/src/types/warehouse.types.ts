import { AddWarehouseSchema } from '@/validations/admin/add-warehouse';
import { z } from 'zod';

export type AddWarehouseType = z.infer<typeof AddWarehouseSchema>;
