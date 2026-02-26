import { ContactUsFormSchema } from '@/validations/contactUs/contactUs';

import { z } from 'zod';

export type ContactUsType = z.infer<typeof ContactUsFormSchema>;
