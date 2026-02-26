CREATE TABLE public.ehs_first_principles (
    "id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "title" text,
    "description" text,
    "image_url" varchar,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.ehs_first_principles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access to all users"
ON public.ehs_first_principles
FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable update access to admins only"
ON public.ehs_first_principles
FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'user_role') = 'admin')
WITH CHECK ((auth.jwt() ->> 'user_role') = 'admin');

CREATE POLICY "Enable insert access to admins only"
ON public.ehs_first_principles
FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'user_role') = 'admin');

CREATE POLICY "Enable delete access to admins only"
ON public.ehs_first_principles
FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'user_role') = 'admin');