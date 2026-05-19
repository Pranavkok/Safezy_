import { z } from 'zod';

export const ComplaintFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .email('Please provide a valid email address.'),
  company_name: z.string().trim().optional(),
  phone: z
    .string()
    .trim()
    .optional()
    .refine(v => !v || /^[0-9+\-\s()]{7,15}$/.test(v), 'Please enter a valid phone number.'),
  subject: z.string().trim().min(1, 'Subject is required.'),
  message: z
    .string()
    .trim()
    .min(1, 'Message is required.')
    .max(1000, 'Message must not exceed 1000 characters.')
});

export type ComplaintFormType = z.infer<typeof ComplaintFormSchema>;
