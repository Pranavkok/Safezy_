import { UpdateProfileFormSchema } from '@/validations/contractor/update-profile';
import { z } from 'zod';

export type UpdateProfileType = z.infer<typeof UpdateProfileFormSchema>;
