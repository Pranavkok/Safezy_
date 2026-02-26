CREATE TABLE public.transaction (
    "id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "date" date NOT NULL,
    "payment_mode" text NOT NULL,
    "transaction_status" text NOT NULL,
    "payment_gateway_transaction_id" varchar NOT NULL,
    "amount" float NOT NULL,
    "user_id" uuid NOT NULL,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT transaction_user_id_fkey FOREIGN KEY ("user_id") REFERENCES public.users ("id")
);

ALTER TABLE public.transaction ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access to authenticated users only"
ON public.transaction
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert access to authenticated users only"
ON public.transaction
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);