CREATE TABLE public.ehs_checklist_questions (
    "id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "question" text NOT NULL,
    "weightage" bigint NOT NULL,
    "topic_id" bigint NOT NULL,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT ehs_checklist_questions_topic_id_fkey FOREIGN KEY ("topic_id") REFERENCES public.ehs_checklist_topics ("id") ON DELETE CASCADE
);

ALTER TABLE public.ehs_checklist_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access to authenticated users only"
ON public.ehs_checklist_questions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert access to admins only"
ON public.ehs_checklist_questions
FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'user_role') = 'admin');

CREATE POLICY "Enable delete access to admins only"
ON public.ehs_checklist_questions
FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'user_role') = 'admin');