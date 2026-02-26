import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['application/pdf'];

export const addFirstPrinciplesSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  image_url: z
    .custom<FileList>()
    .transform(file => (file.length > 0 ? file[0] : null))
    .refine(
      file => file === null || file.size <= MAX_FILE_SIZE,
      'File size must be less than 5MB'
    )
    .refine(
      file => file === null || ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Only PDF files are accepted'
    )
});
