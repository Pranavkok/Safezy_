import { z } from 'zod';

// Add Employee Schema
export const AddEmployeeSchema = z.object({
  // Name is required and must be a non-empty string
  name: z.string().trim().min(1, 'Employee Name is required.'),
  // Contact number is optional, but if provided, must be a valid 10-digit number

  contact_number: z
    .string()
    .trim()
    .length(10, { message: 'Contact number must be 10 digits.' })
    .regex(/^[0-9]{10}$/, {
      message: 'Please enter a valid 10-digit contact number.'
    })
    .optional(),
  // Worksite is required and must be a non-empty string
  site_name: z.string().trim().min(1, 'Worksite is required.'),
  // Designation is optional, but if provided, must be between 2 and 50 characters, only letters and spaces
  designation: z
    .string()
    .trim()
    .min(2, { message: 'Designation is required.' })
    .max(50, { message: 'Designation must be at most 50 characters long.' })
    .regex(/^[a-zA-Z\s]+$/, {
      message: 'Designation can only contain letters and spaces.'
    })
    .optional(),
  // Department is optional, but if provided, must have a minimum length of 2
  department: z
    .string()
    .trim()
    .min(2, { message: 'Department is required.' })
    .optional(),
  // Plant is optional, but if provided, must have a minimum length of 2
  plant: z.string().trim().min(2, { message: 'Plant is required.' }).optional()
});

// Update Employee Schema
export const UpdateEmployeeSchema = z.object({
  // Name is required and must be a non-empty string
  name: z.string().trim().min(1, 'Employee Name is required.'),
  // Contact number is optional, but if provided, must be a valid 10-digit number
  contact_number: z
    .string()
    .trim()
    .length(10, { message: 'Contact number must be 10 digits.' })
    .regex(/^[0-9]{10}$/, {
      message: 'Please enter a valid 10-digit contact number.'
    })
    .optional(),
  // Worksite is required and must be a non-empty string
  site_name: z.string().trim().min(1, 'Worksite is required.'),
  // Designation is optional, but if provided, must be between 2 and 50 characters, only letters and spaces
  designation: z
    .string()
    .trim()
    .min(2, { message: 'Designation is required.' })
    .max(50, { message: 'Designation must be at most 50 characters long.' })
    .regex(/^[a-zA-Z\s]+$/, {
      message: 'Designation can only contain letters and spaces.'
    })
    .optional(),
  // Department is optional, but if provided, must have a minimum length of 2
  department: z
    .string()
    .trim()
    .min(2, { message: 'Department is required.' })
    .optional(),
  // Plant is optional, but if provided, must have a minimum length of 2
  plant: z.string().trim().min(2, { message: 'Plant is required.' }).optional()
});
