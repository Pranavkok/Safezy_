import {
  AddWorksiteSchema,
  UpdateWorksiteSchema
} from '@/validations/contractor/add-worksite';
import { z } from 'zod';

export type AddWorksiteType = z.infer<typeof AddWorksiteSchema>;

export type UpdateWorksiteType = z.infer<typeof UpdateWorksiteSchema>;
