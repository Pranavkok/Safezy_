CREATE TABLE public.cart_items (
    "id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "quantity" integer NOT NULL,
    "product_size" text NOT NULL,
    "product_color" text NOT NULL,
    "item_price" float NOT NULL,
    "user_id" uuid NOT NULL,
    "product_id" uuid NOT NULL,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT cart_items_user_id_fkey FOREIGN KEY ("user_id") REFERENCES public.users ("id"),
    CONSTRAINT cart_items_product_id_fkey FOREIGN KEY ("product_id") REFERENCES public.product ("id")
);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access to authenticated users only"
ON public.cart_items
FOR SELECT
TO authenticated
USING (auth.uid() = ( SELECT users.auth_id FROM users WHERE (users.id = cart_items.user_id)));

CREATE POLICY "Enable insert access to authenticated users only"
ON public.cart_items
FOR INSERT
TO authenticated
WITH CHECK ( (auth.jwt() ->> 'user_role') = 'contractor');

CREATE POLICY "Enable update access to authenticated users only"
ON public.cart_items
FOR UPDATE
TO authenticated
USING (auth.uid() = ( SELECT users.auth_id FROM users WHERE (users.id = cart_items.user_id)));

CREATE POLICY "Enable delete access to authenticated users only"
ON public.cart_items
FOR DELETE
TO authenticated
USING (auth.uid() = ( SELECT users.auth_id FROM users WHERE (users.id = cart_items.user_id)));