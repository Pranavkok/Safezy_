CREATE TABLE public.employee (
    "id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "name" varchar NOT NULL,
    "contact_number" varchar NOT NULL,
    "designation" varchar,
    "department" varchar,
    "plant" varchar,
    "assigned_equipments" bigint,
    "worksite_id" uuid,
    "user_id" uuid,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT employee_worksite_id_fkey FOREIGN KEY ("worksite_id") REFERENCES public.worksite ("id"),
    CONSTRAINT employee_user_id_fkey FOREIGN KEY ("user_id") REFERENCES public.users ("id")
);

ALTER TABLE public.employee ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access to authenticated users only"
ON public.employee
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert access to authenticated users only"
ON public.employee
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update access to authenticated users only"
ON public.employee
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.users
        WHERE users.auth_id = auth.uid() AND users.id = employee.user_id
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.users
        WHERE users.auth_id = auth.uid() AND users.id = employee.user_id
    )
);

CREATE POLICY "Enable delete access to authenticated users only"
ON public.employee
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.users
        WHERE users.auth_id = auth.uid() AND users.id = employee.user_id
    )
);