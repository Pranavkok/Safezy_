CREATE TABLE public.ehs_toolbox_talk (
    "id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "topic_name" varchar NOT NULL,
    "pdf_url" varchar,
    "description" text,
    "avg_rating" float4,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.ehs_toolbox_talk ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access to all users"
ON public.ehs_toolbox_talk
FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert access to admins only"
ON public.ehs_toolbox_talk
FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'user_role') = 'admin');

CREATE POLICY "Enable update access to authenticated users only"
ON public.ehs_toolbox_talk
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete access to admins only"
ON public.ehs_toolbox_talk
FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'user_role') = 'admin');
