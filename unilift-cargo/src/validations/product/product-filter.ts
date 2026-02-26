import { z } from 'zod';

export const AVAILABLE_CATEGORIES = [
  'all',
  'head_protection',
  'respiratory_protection',
  'face_protection',
  'eye_protection',
  'hand_protection',
  'leg_protection',
  'fall_protection',
  'body_protection',
  'ear_protection'
] as const;

export const AVAILABLE_SORT = ['featured', 'price-asc', 'price-desc'] as const;

export const ProductFilterSchema = z.object({
  category: z.array(z.enum(AVAILABLE_CATEGORIES)),
  subCategory: z.array(z.string()),
  geographical: z.array(z.string()),
  brand: z.string(),
  sort: z.enum(AVAILABLE_SORT),
  price: z.tuple([z.number(), z.number()]),
  color: z.string(),
  rating: z.number(),
  search: z.string(),
  page: z.number()
});

export type ProductFilterType = Omit<
  z.infer<typeof ProductFilterSchema>,
  'price'
> & {
  price: {
    range: [number, number];
  };
};
