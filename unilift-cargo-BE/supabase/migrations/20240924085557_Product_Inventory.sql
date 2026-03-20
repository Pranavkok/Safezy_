CREATE TABLE public.product_inventory (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "product_quantity" bigint,
    "product_size" varchar,
    "product_color" varchar,
    "product_name" varchar,
    "product_category" varchar,
    "base_quantity" bigint NOT NULL,
    "order_items_id" bigint NOT NULL,
    "product_id" uuid,
    "user_id" uuid,
    "worksite_id" uuid,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT product_inventory_order_items_id_fkey FOREIGN KEY ("order_items_id") REFERENCES public.order_items ("id"),
    CONSTRAINT product_inventory_product_id_fkey FOREIGN KEY ("product_id") REFERENCES public.product ("id"),
    CONSTRAINT product_inventory_user_id_fkey FOREIGN KEY ("user_id") REFERENCES public.users ("id"),
    CONSTRAINT product_inventory_worksite_id_fkey FOREIGN KEY ("worksite_id") REFERENCES public.worksite ("id")
);

ALTER TABLE public.product_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access to authenticated users only"
ON public.product_inventory
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert access to authenticated users only"
ON public.product_inventory
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update access to authenticated users only"
ON public.product_inventory
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);