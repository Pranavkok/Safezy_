CREATE TYPE "orderStatus" AS ENUM (
    'Processing',
    'Returned',
    'Delivered',
    'Shipped',
    'Cancelled',
    'Complaint',
    'Out For Delivery'
);

CREATE TABLE public."order" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "date" date NOT NULL,
    "total_amount" float NOT NULL,
    "order_status" "orderStatus" NOT NULL,
    "is_delivered" boolean DEFAULT false,
    "added_to_inventory" boolean DEFAULT false,
    "shipping_charges" float NOT NULL,
    "estimated_delivery_date" date,
    "is_feedback_added" boolean DEFAULT false,
    "user_id" uuid NOT NULL,
    "address_id" bigint NOT NULL,
    "warehouse_operator_id" uuid,
    "transaction_id" bigint,
    "is_email_sent" boolean,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT order_user_id_fkey FOREIGN KEY ("user_id") REFERENCES public.users ("id"),
    CONSTRAINT order_address_id_fkey FOREIGN KEY ("address_id") REFERENCES public.address ("id"),
    CONSTRAINT order_warehouse_operator_id_fkey FOREIGN KEY ("warehouse_operator_id") REFERENCES public.users ("id"),
    CONSTRAINT order_transaction_id_fkey FOREIGN KEY ("transaction_id") REFERENCES public.transaction ("id")
);

ALTER TABLE public."order" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access to authenticated users only"
ON public."order"
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert access to authenticated users only"
ON public."order"
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update access to authenticated users only"
ON public."order"
FOR UPDATE
TO authenticated
USING (
    auth.uid() IS NOT NULL OR 
    EXISTS (
        SELECT 1 
        FROM public.users 
        WHERE users.auth_id = auth.uid() AND users.id = "order".user_id
    ) OR 
    (auth.jwt() ->> 'user_role' = 'admin')
)
WITH CHECK (
    auth.uid() IS NOT NULL OR 
    EXISTS (
        SELECT 1 
        FROM public.users 
        WHERE users.auth_id = auth.uid() AND users.id = "order".user_id
    ) OR 
    (auth.jwt() ->> 'user_role' = 'admin')
);

