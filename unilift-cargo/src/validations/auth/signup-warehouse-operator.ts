import { z } from 'zod';

export const SignUpWarehouseOperatorSchema = z.object({
  storeName: z
    .string()
    .min(1, 'Store Name is required')
    .max(100, 'Store Name must be less than 100 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  address1: z
    .string()
    .min(1, 'Address 1 is required')
    .max(200, 'Address 1 must be less than 200 characters'),
  address2: z.string(),
  locality: z.string(),
  city: z
    .string()
    .min(1, 'City is required')
    .max(100, 'City must be less than 100 characters'),
  zipcode: z
    .string()
    .min(1, 'Zipcode is required')
    .max(10, 'Zipcode must be less than 10 characters'),
  state: z
    .string()
    .min(1, 'State is required')
    .max(100, 'State must be less than 100 characters'),
  country: z
    .string()
    .min(1, 'Country is required')
    .max(100, 'Country must be less than 100 characters'),
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
