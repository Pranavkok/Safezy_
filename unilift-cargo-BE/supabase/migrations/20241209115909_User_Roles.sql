CREATE TYPE "app_role" AS ENUM (
    'admin', 
    'contractor', 
    'principle', 
    'warehouse_operator'
);

CREATE TABLE public.user_roles (
    "id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "role" app_role NOT NULL,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

INSERT INTO public.user_roles ("role")
VALUES
('admin'),
('contractor'),
('principle'),
('warehouse_operator');

CREATE POLICY "Enable read access to authenticated and auth admin users only"
ON public.user_roles
FOR SELECT
TO authenticated, anon, supabase_auth_admin
USING (true);

CREATE POLICY "Enable insert access to authenticated users only"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);
