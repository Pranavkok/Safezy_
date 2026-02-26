import { z } from 'zod';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const AddComplaintSchema = z.object({
  image: z
    .any()
    .refine(files => files?.length === 1, 'Image is required.')
    .refine(files => files?.[0]?.size <= MAX_FILE_SIZE, 'Max file size is 5MB.')
    .refine(
      files => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      '.jpg, .jpeg, .png and .webp files are accepted.'
    ),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must not exceed 500 characters')
});
