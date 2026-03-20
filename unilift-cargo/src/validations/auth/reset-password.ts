import { z } from 'zod';

export const ResetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .trim()
      .min(8, 'Password must be at least 8 characters long.')
      .regex(/[a-z]/, 'Password must include at least one lowercase letter.')
      .regex(/[A-Z]/, 'Password must include at least one uppercase letter.')
      .regex(/\d/, 'Password must include at least one number.')
      .regex(/[\W_]/, 'Password must include at least one special character.'),
    confirmPassword: z.string().trim()
  })
  .refine(
    ({ newPassword, confirmPassword }) => newPassword === confirmPassword,
    {
      message: 'Passwords do not match.',
      path: ['confirmPassword']
    }
  );
