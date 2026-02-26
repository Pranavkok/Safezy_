CREATE TABLE public.contact (
   "id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "first_name" varchar NOT NULL,
    "last_name" varchar NOT NULL,
    "email" varchar NOT NULL,
    "contact_number" varchar ,
    "company_name" varchar,
    "requirements" text NOT NULL,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.contact ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access to all users"
ON public.contact
FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert access to all users"
ON public.contact
FOR INSERT
TO public
WITH CHECK (true);