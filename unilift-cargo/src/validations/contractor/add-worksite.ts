import { z } from 'zod';

export const AddWorksiteSchema = z.object({
  site_name: z.string().min(1, 'Worksite Name is required.'),
  contact_number: z
    .string()
    .trim()
    .length(10, { message: 'Contact number must be 10 digits.' })
    .regex(/^[0-9]{10}$/, {
      message: 'Please enter a valid 10-digit contact number.'
    }),
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required.')
    .email('Please provide a valid email address.'),
  site_manager: z.string().min(1, 'Worksite Manager is required.'),
  address1: z
    .string()
    .min(1, 'Address 1 is required')
    .max(200, 'Address 1 must be less than 200 characters'),
  address2: z.string().optional(),
  locality: z.string().optional(),
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
    .max(100, 'Country must be less than 100 characters')
});

export const UpdateWorksiteSchema = z.object({
  site_name: z.string().min(1, 'Worksite Name is required.'),
  contact_number: z
    .string()
    .trim()
    .length(10, { message: 'Contact number must be 10 digits.' })
    .regex(/^[0-9]{10}$/, {
      message: 'Please enter a valid 10-digit contact number.'
    }),
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required.')
    .email('Please provide a valid email address.'),
  site_manager: z.string().min(1, 'Worksite Manager is required.'),
  address1: z
    .string()
    .min(1, 'Address 1 is required')
    .max(200, 'Address 1 must be less than 200 characters'),
  address2: z.string().optional(),
  locality: z.string().optional(),
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
    .max(100, 'Country must be less than 100 characters')
});
