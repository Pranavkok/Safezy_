-- Add header_fields to checklist topics (admin defines custom fields per checklist)
ALTER TABLE public.ehs_checklist_topics
  ADD COLUMN "header_fields" jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Add header_values to checklist user submissions (stores user-filled header field values)
ALTER TABLE public.ehs_checklist_users
  ADD COLUMN "header_values" jsonb NOT NULL DEFAULT '[]'::jsonb;
