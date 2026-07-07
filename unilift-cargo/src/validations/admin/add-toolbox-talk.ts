import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const AddToolboxTalkUserSchema = z.object({
  comments: z.string().optional()
});

export const AddToolboxTalkSchema = z.object({
  topic_name: z.string().min(1, 'Topic name is required'),
  description: z.string().optional(),
  summarize: z.string().optional(),
  // Accept a File[] (multiple images) — validated individually
  images: z
    .array(
      z
        .instanceof(File)
        .refine(file => file.size <= MAX_FILE_SIZE, 'Each file must be less than 5MB')
        .refine(
          file => ACCEPTED_FILE_TYPES.includes(file.type),
          'Only JPEG, PNG and WEBP images are accepted'
        )
    )
    .optional()
});
