import { z } from 'zod';

export const AddSuggestionSchema = z.object({
  topic_name: z.string().min(1, 'Suggestion Topic Name is required'),
  suggestion_type: z
    .enum(['checklist', 'first_principle', 'toolbox_talk'])
    .optional()
});
