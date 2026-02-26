CREATE TABLE public.address (
    "id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "street1" varchar NOT NULL,
    "street2" varchar,
    "locality" varchar,
    "city" varchar NOT NULL,
    "zipcode" varchar NOT NULL,
    "state" varchar NOT NULL,
    "country" varchar NOT NULL,
    "user_id" uuid,
    "worksite_id" uuid,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT address_user_id_fkey FOREIGN KEY ("user_id") REFERENCES public.users ("id"),
    CONSTRAINT address_worksite_id_fkey FOREIGN KEY ("worksite_id") REFERENCES public.worksite ("id")
);

ALTER TABLE public.address ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access to authenticated users only"
ON public.address
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert access to authenticated users only"
ON public.address
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Enable update access to authenticated users only"
ON public.address
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);
