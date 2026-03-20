CREATE TYPE "checklist_options" AS ENUM (
    'Yes',
    'No',
    'N/A'
);

CREATE TABLE public.ehs_checklist_done_questions (
   "id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
   "remarks" text,
   "is_completed" "checklist_options" NOT NULL,
   "question_id" bigint,
   "checklist_user_id" bigint,
   "created_at" timestamp with time zone NOT NULL DEFAULT now(),
   "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
   CONSTRAINT ehs_checklist_done_questions_question_id_fkey FOREIGN KEY ("question_id") REFERENCES public.ehs_checklist_questions ("id") ON DELETE CASCADE,
   CONSTRAINT ehs_checklist_done_questions_checklist_user_id_fkey FOREIGN KEY ("checklist_user_id") REFERENCES public.ehs_checklist_users ("id")
 );

ALTER TABLE public.ehs_checklist_done_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access to authenticated users only"
ON public.ehs_checklist_done_questions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable update access to authenticated users only"
ON public.ehs_checklist_done_questions
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable insert access to authenticated users only"
ON public.ehs_checklist_done_questions
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable delete access to authenticated users only"
ON public.ehs_checklist_done_questions
FOR DELETE
TO authenticated
USING (true);