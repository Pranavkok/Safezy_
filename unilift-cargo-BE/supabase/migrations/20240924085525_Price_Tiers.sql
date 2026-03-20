CREATE TABLE public.price_tiers (
    "id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "min_quantity" bigint NOT NULL,
    "max_quantity" bigint NOT NULL,
    "price" float NOT NULL,
    "product_id" uuid NOT NULL,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT price_tiers_product_id_fkey FOREIGN KEY ("product_id") REFERENCES public.product ("id")
);

ALTER TABLE public.price_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access to all users"
ON public.price_tiers
FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert access to admins only"
ON public.price_tiers
FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'user_role') = 'admin');

CREATE POLICY "Enable delete access to admins only"
ON public.price_tiers
FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'user_role') = 'admin');