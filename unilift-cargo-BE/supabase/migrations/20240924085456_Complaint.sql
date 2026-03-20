CREATE TABLE public.complaint (
    "id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "image" varchar,
    "description" text NOT NULL, 
    "user_id" uuid NOT NULL,
    "order_id" uuid,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT complaint_user_id_fkey FOREIGN KEY ("user_id") REFERENCES public.users ("id"),
    CONSTRAINT complaint_order_id_fkey FOREIGN KEY ("order_id") REFERENCES public.order ("id")
);

ALTER TABLE public.complaint ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access to authenticated users only"
ON public.complaint
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert access to authenticated users only"
ON public.complaint
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);