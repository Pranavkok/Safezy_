CREATE TABLE public.worksite (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "site_name" varchar NOT NULL,
    "email" varchar NOT NULL,
    "site_manager" varchar,
    "unique_code" varchar NOT NULL,
    "contact_number" varchar,
    "user_id" uuid NOT NULL,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT worksite_user_id_fkey FOREIGN KEY ("user_id") REFERENCES public.users ("id")

);

ALTER TABLE public.worksite ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access to authenticated users only"
ON public.worksite
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users only"
ON public.worksite
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update access to authenticated users only"
ON public.worksite
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK ((auth.uid() IS NOT NULL));
