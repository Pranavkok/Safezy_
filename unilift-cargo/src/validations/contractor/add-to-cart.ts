import { z } from 'zod';

export const AddToCartSchema = z.object({
  size: z
    .string({
      required_error: 'Please select a size'
    })
    .trim()
    .min(1, 'Please select a size'),
  color: z
    .string({
      required_error: 'Please select a color'
    })
    .trim()
    .min(1, 'Please select a color'),
  quantity: z
    .number({
      required_error: 'Quantity is required',
      invalid_type_error: 'Quantity is required'
    })
    .min(1, 'Quantity must be at least 1')
});

export type AddToCartType = z.infer<typeof AddToCartSchema>;
