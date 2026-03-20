CREATE TABLE public.ehs_news (
    "id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "title" text,
    "description" text,
    "image_url" text,
    "preview_url" text,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.ehs_news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access to all users"
ON public.ehs_news
FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert access to authenticated users only"
ON public.ehs_news
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable delete access to authenticated users only"
ON public.ehs_news
FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Enable update access to autheticated users only"
ON public.ehs_news
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);