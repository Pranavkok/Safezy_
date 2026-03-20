CREATE TYPE "ehs_suggestion_type" AS ENUM (
    'checklist',
    'first_principle',
    'toolbox_talk'
);

CREATE TABLE public.ehs_suggestions (
   "id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
   "topic_name" text NOT NULL,
   "suggestion_type" "ehs_suggestion_type" NOT NULL,
   "created_at" timestamp with time zone NOT NULL DEFAULT now(),
   "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.ehs_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access to authenticated users only"
ON public.ehs_suggestions
FOR SELECT
TO authenticated
USING ((auth.jwt() ->> 'user_role') = 'admin');

CREATE POLICY "Enable insert access to authenticated users only"
ON public.ehs_suggestions
FOR INSERT
TO authenticated
WITH CHECK (true);