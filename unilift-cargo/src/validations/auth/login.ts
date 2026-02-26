import { z } from 'zod';

export const LoginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .email('Please provide a valid email address.'),
  password: z.string().trim().min(1, 'Password is required.')
});
