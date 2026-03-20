import { z } from 'zod';

export const AddToolboxNoteSchema = z.object({
  note: z.string().optional()
});
