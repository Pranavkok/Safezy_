import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const AddToolboxTalkUserSchema = z.object({
  superior_email: z.string().min(1, "Superior's Email is required"),
  best_performer: z.string().min(1, "Best performer's name is required")
});

export const AddToolboxTalkSchema = z.object({
  topic_name: z.string().min(1, 'Topic name is required'),
  description: z.string().optional(),
  summarize: z.string().optional(),
  pdf_url: z
    .custom<FileList>()
    .transform(file => (file.length > 0 ? file[0] : null))
    .refine(
      file => file === null || file.size <= MAX_FILE_SIZE,
      'File size must be less than 5MB'
    )
    .refine(
      file => file === null || ACCEPTED_FILE_TYPES.includes(file.type),
      'Only PDF files are accepted'
    )
});
