import { z } from 'zod';

export const SignUpFormSchema = z
  .object({
    fName: z.string().trim().min(1, 'First Name is required.'),
    lName: z.string().trim().min(1, 'Last Name is required.'),
    cName: z.string().trim().min(1, 'Company Name is required.'),
    contactNumber: z
      .string()
      .trim()
      .min(1, 'Contact Number is required')
      .length(10, { message: 'Contact number must be 10 digits.' })
      .regex(/^[0-9]{10}$/, {
        message: 'Please enter a valid 10-digit contact number.'
      }),
    email: z
      .string()
      .trim()
      .min(1, 'Email address is required.')
      .email('Please provide a valid email address.'),
    noOfWorkers: z.string().min(1, 'Total number of workers is required.'),
    typeOfServicesProvided: z
      .array(z.string())
      .min(1, 'Please select at least one service.'),
    typeOfServicesProvidedOther: z.string().optional(),
    industriesServed: z
      .array(z.string())
      .min(1, 'Please select at least one industry.'),
    geographicalLocation: z
      .array(z.string())
      .min(1, 'Please select at least one geographical location.'),
    industriesServedOther: z.string().optional(),
    companies: z.array(
      z.object({
        value: z.string().optional(),
        id: z.string().min(1, 'Company ID is required.')
      })
    ),
    locations: z
      .array(
        z.object({
          value: z.string().optional(),
          id: z.string().min(1, 'Location ID is required.')
        })
      )
      .refine(
        locations => {
          if (locations.length === 0) return false;
          const { value, id } = locations[0];
          return value?.trim() !== '' && id.trim() !== '';
        },
        {
          message: 'At least one location  is required.',
          path: ['0', 'value']
        }
      ),
    password: z
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
    data => {
      if (data.typeOfServicesProvided.includes('other')) {
        return data.typeOfServicesProvidedOther?.trim() !== '';
      }
      return true;
    },
    {
      message: 'Please specify the other service provided.',
      path: ['typeOfServicesProvidedOther']
    }
  )
  .refine(
    data => {
      if (data.industriesServed.includes('other')) {
        return data.industriesServedOther?.trim() !== '';
      }
      return true;
    },
    {
      message: 'Please specify the other industry served.',
      path: ['industriesServedOther']
    }
  )
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword']
  });

export const OtpVerificationFormSchema = z.object({
  otp: z.string().length(6, {
    message: 'Your one-time password must be exactly 6 characters.'
  })
});
