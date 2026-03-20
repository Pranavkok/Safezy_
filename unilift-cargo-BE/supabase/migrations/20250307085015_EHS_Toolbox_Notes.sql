CREATE TABLE public.ehs_toolbox_notes (
    "id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "note" text,
    "user_id" uuid,
    "toolbox_talk_id" bigint,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT ehs_toolbox_notes_user_id_fkey FOREIGN KEY ("user_id") REFERENCES public.users ("id"),
    CONSTRAINT ehs_toolbox_notes_toolbox_talk_id_fkey FOREIGN KEY ("toolbox_talk_id") REFERENCES public.ehs_toolbox_talk ("id")
);

ALTER TABLE public.ehs_toolbox_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access to authenticated users only"
ON public.ehs_toolbox_notes
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert access to authenticated users only"
ON public.ehs_toolbox_notes
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update access to authenticated users only"
ON public.ehs_toolbox_notes
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);