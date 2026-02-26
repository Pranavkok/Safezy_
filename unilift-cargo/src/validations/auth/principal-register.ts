import { z } from 'zod';

export const PrincipalRegistrationSchema = z.object({
  fName: z.string().trim().min(1, 'Username is required.'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .email('Please provide a valid email address.'),
  contactNumber: z
    .string()
    .trim()
    .min(1, 'Contact Number is required')
    .length(10, { message: 'Contact number must be 10 digits.' })
    .regex(/^[0-9]{10}$/, {
      message: 'Please enter a valid 10-digit contact number.'
    }),
  password: z
    .string()
    .trim()
    .min(8, 'Password must be at least 8 characters long.')
    .regex(/[a-z]/, 'Password must include at least one lowercase letter.')
    .regex(/[A-Z]/, 'Password must include at least one uppercase letter.')
    .regex(/\d/, 'Password must include at least one number.')
    .regex(/[\W_]/, 'Password must include at least one special character.')
});
