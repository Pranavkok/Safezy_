import { z } from 'zod';

export const ContactUsFormSchema = z.object({
  fName: z.string().trim().min(1, 'First Name is required.'),
  lName: z.string().trim().min(1, 'Last Name is required.'),
  requirement: z.string().trim().min(1, 'Requirement is required.'),
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required.')
    .email('Please provide a valid email address.'),
  phoneNumber: z
    .string()
    .trim()
    .min(1, 'Contact Number is required')
    .length(10, { message: 'Contact number must be 10 digits.' })
    .regex(/^[0-9]{10}$/, {
      message: 'Please enter a valid 10-digit contact number.'
    }),

  cName: z.string().trim().min(1, 'Company Name is required.')
});
