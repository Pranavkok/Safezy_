CREATE TABLE public.order_items (
    "id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "quantity" bigint NOT NULL,
    "price" float NOT NULL,
    "product_name" varchar,
    "product_size" text,
    "product_color" text,
    "order_id" uuid NOT NULL,
    "product_id" uuid NOT NULL,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT order_items_order_id_fkey FOREIGN KEY ("order_id") REFERENCES public.order ("id"),
    CONSTRAINT order_items_product_id_fkey FOREIGN KEY ("product_id") REFERENCES public.product ("id")
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access to authenticated users only"
ON public.order_items
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert access to authenticated users only"
ON public.order_items
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);