import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const SubscribeToBlogSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
});

export const AddBlogSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  long_description: z.string().optional(),
  image_url: z
    .custom<FileList>()
    .transform(file => (file.length > 0 ? file[0] : null))
    .refine(
      file => file === null || file.size <= MAX_FILE_SIZE,
      'File size must be less than 5MB'
    )
    .refine(
      file => file === null || ACCEPTED_FILE_TYPES.includes(file.type),
      'Only JPG, PNG, or WebP images are accepted'
    )
});
