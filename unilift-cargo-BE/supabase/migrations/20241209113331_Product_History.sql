CREATE TABLE public.product_history (
    "id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "quantity" bigint NOT NULL,
    "assigned_date" date NOT NULL,
    "unassigned_date" date,
    "employee_id" bigint NOT NULL,
    "inventory_id" uuid NOT NULL,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT product_history_employee_id_fkey FOREIGN KEY ("employee_id") REFERENCES public.employee ("id"),
    CONSTRAINT product_history_inventory_id_fkey FOREIGN KEY ("inventory_id") REFERENCES public.product_inventory ("id")
);

ALTER TABLE public.product_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access to all users"
ON public.product_history
FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert access to authenticated users only"
ON public.product_history
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update access to authenticated users only"
ON public.product_history
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable delete access to authenticated users only"
ON public.product_history
FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);