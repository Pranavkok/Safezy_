import { z } from 'zod';

export const AddStaffSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  contactNumber: z
    .string()
    .min(10, 'Contact number must be at least 10 digits')
    .regex(/^\d+$/, 'Contact number must contain only digits'),
  role: z.enum(['manager', 'safety_officer'], {
    required_error: 'Please select a role'
  })
});

export type AddStaffFormType = z.infer<typeof AddStaffSchema>;
