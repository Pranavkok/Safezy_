CREATE TABLE public.users (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "first_name" varchar NOT NULL,
    "last_name" varchar NOT NULL,
    "email" varchar NOT NULL,
    "contact_number" varchar NOT NULL,
    "company_name" varchar,
    "total_workers" varchar,
    "service_type" jsonb,
    "industries_type" jsonb,
    "other_services_type" varchar,
    "other_industries_type" varchar,
    "locations_served" jsonb,
    "companies_served" jsonb,
    "auth_id" uuid NOT NULL,
    "is_active" boolean DEFAULT TRUE,
    "user_unique_code" text,
    "geographical_location" jsonb,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT unique_email UNIQUE ("email"),
    CONSTRAINT unique_auth_id UNIQUE ("auth_id")
) TABLESPACE pg_default;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access to all users"
ON public.users
FOR SELECT
TO public
USING ( true );

CREATE POLICY "Enable insert access to all users"
ON public.users
FOR INSERT
TO public
WITH CHECK ( true );

CREATE policy "Enable update access to authenticated users only"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK ((auth.uid() IS NOT NULL));