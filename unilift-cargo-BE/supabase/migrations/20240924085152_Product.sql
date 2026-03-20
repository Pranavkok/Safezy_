CREATE TABLE public.product (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "ppe_name" varchar NOT NULL,
    "product_ID" varchar,
    "ppe_category" varchar NOT NULL,
    "sub_category" varchar,
    "image" varchar NOT NULL,
    "description" text NOT NULL,
    "brand_name" varchar NOT NULL,
    "size" jsonb NOT NULL,
    "color" jsonb NOT NULL,
    "use_life" bigint NOT NULL,
    "industry_use" jsonb,
    "training_video" varchar NOT NULL,
    "avg_rating" float,
    "price" float,
    "is_deleted" boolean NOT NULL DEFAULT FALSE,
    "gst" float,
    "hsn_code" text,
    "geographical_location" text[] DEFAULT '{}'::text[],
    "lead_time" jsonb,
    "is_out_of_stock" boolean DEFAULT false,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.product ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access to all users"
ON public.product
FOR SELECT
TO public
USING ( true );

CREATE POLICY "Enable insert access to admins only"
ON public.product
FOR INSERT
TO authenticated
WITH CHECK (( (auth.jwt() ->> 'user_role')) = 'admin');

CREATE POLICY "Enable update access to admins only"
ON public.product
FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'user_role') = 'admin')
WITH CHECK ((auth.jwt() ->> 'user_role') = 'admin');

CREATE POLICY "Enable delete access to admins only"
ON public.product
FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'user_role') = 'admin');