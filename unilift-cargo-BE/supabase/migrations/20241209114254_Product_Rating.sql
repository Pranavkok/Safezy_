CREATE TABLE public.product_rating (
    "id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "rating" float NOT NULL,
    "description" text,
    "product_id" uuid,
    "user_id" uuid,
    "order_id" uuid,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT product_rating_product_id_fkey FOREIGN KEY ("product_id") REFERENCES public.product ("id"),
    CONSTRAINT product_rating_user_id_fkey FOREIGN KEY ("user_id") REFERENCES public.users ("id"),
    CONSTRAINT product_rating_order_id_fkey FOREIGN KEY ("order_id") REFERENCES public.order ("id")
);

ALTER TABLE public.product_rating ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access to all users"
ON public.product_rating
FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert access to authenticated users only"
ON public.product_rating
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);