import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const headerFieldSchema = z.object({
  label: z.string().min(1, 'Field label is required')
});

export const questionSchema = z.object({
  question_id: z.string().optional().nullable(),
  question: z.string().min(1, 'Question is required'),
  weight: z.string().min(1, 'Weight is required')
});

export const EhsChecklistFormSchema = z.object({
  topic_name: z.string().min(1, 'Topic name is required'),
  header_fields: z.array(headerFieldSchema).optional().default([]),
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

export const headerValueSchema = z.object({
  label: z.string(),
  value: z.string().optional().default('')
});

export const formSchema = z.object({
  topicId: z.number(),
  answers: z.array(answerSchema),
  header_values: z.array(headerValueSchema).optional().default([]),
  site_name: z.string().min(1, 'Site name is required'),
  inspected_by: z.string().min(1, 'Inspected by is required'),
  date: z.string().min(1, 'Date is required'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .min(1, 'Email is required'),
  cc_emails: z
    .array(z.string().email('Invalid email address'))
    .optional()
    .default([])
});
