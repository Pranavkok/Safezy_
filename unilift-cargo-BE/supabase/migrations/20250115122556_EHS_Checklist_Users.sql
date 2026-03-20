CREATE TABLE public.ehs_checklist_users (
    "id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "progress" jsonb,
    "site_name" text,
    "inspected_by" text,
    "date" date,
    "topic_id" bigint,
    "user_id" uuid,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT ehs_checklist_users_topic_id_fkey FOREIGN KEY ("topic_id") REFERENCES public.ehs_checklist_topics ("id") ON DELETE CASCADE,
    CONSTRAINT ehs_checklist_users_user_id_fkey FOREIGN KEY ("user_id") REFERENCES public.users ("id")
);

ALTER TABLE public.ehs_checklist_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access to all users"
ON public.ehs_checklist_users
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable update access to authenticated users only"
ON public.ehs_checklist_users
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable insert access to authenticated users only"
ON public.ehs_checklist_users
FOR INSERT
TO authenticated
WITH CHECK (true);