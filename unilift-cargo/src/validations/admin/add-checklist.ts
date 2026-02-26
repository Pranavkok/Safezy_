import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const questionSchema = z.object({
  question_id: z.string().optional().nullable(),
  question: z.string().min(1, 'Question is required'),
  weight: z.string().min(1, 'Weight is required')
});

export const EhsChecklistFormSchema = z.object({
  topic_name: z.string().min(1, 'Topic name is required'),
  questions: z
    .array(questionSchema)
    .min(1, 'At least one question is required'),
  image_url: z
    .custom<FileList>()
    .transform(file => (file.length > 0 ? file[0] : null))
    .refine(
      file => file === null || file.size <= MAX_FILE_SIZE,
      'File size must be less than 5MB'
    )
    .refine(
      file => file === null || ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Only Image files are accepted'
    )
});

export const answerSchema = z.object({
  questionId: z.number(),
  questionText: z.string(),
  answer: z.enum(['Yes', 'No', 'N/A']).optional(),
  remark: z.string().optional(),
  weightage: z.number()
});

export const formSchema = z.object({
  topicId: z.number(),
  answers: z.array(answerSchema),
  site_name: z.string(),
  inspected_by: z.string(),
  date: z.string(),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .min(1, 'Email is required')
});
