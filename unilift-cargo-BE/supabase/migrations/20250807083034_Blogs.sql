CREATE TABLE public.blogs (
    "id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "title" text,
    "description" text,
    "long_description" text,
    "image_url" varchar,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access to all users"
ON public.blogs
FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable update access to admins only"
ON public.blogs
FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'user_role') = 'admin')
WITH CHECK ((auth.jwt() ->> 'user_role') = 'admin');

CREATE POLICY "Enable insert access to admins only"
ON public.blogs
FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'user_role') = 'admin');

CREATE POLICY "Enable delete access to admins only"
ON public.blogs
FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'user_role') = 'admin');