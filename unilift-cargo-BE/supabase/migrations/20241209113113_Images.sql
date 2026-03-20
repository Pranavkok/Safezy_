CREATE TABLE public.images (
    "id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "image_url" varchar NOT NULL,
    "product_id" uuid,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT images_product_id_fkey FOREIGN KEY ("product_id") REFERENCES public.product ("id")
);

ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access to all users"
ON public.images
FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert access to admins only"
ON public.images
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable delete access to admins only"
ON public.images
FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'user_role') = 'admin');