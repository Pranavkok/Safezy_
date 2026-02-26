CREATE TABLE public.ehs_toolbox_users (
    "id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "superior_email" varchar NOT NULL,
    "best_performer" varchar NOT NULL,
    "rating" float4,
    "user_id" uuid NOT NULL,
    "toolbox_talk_id" bigint,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT ehs_toolbox_users_user_id_fkey FOREIGN KEY ("user_id") REFERENCES public.users ("id"),
    CONSTRAINT ehs_toolbox_users_toolbox_talk_id_fkey FOREIGN KEY ("toolbox_talk_id") REFERENCES public.ehs_toolbox_talk ("id") ON DELETE CASCADE
);

ALTER TABLE public.ehs_toolbox_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access to authenticated users only"
ON public.ehs_toolbox_users
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert access to authenticated users only"
ON public.ehs_toolbox_users
FOR INSERT
TO authenticated
WITH CHECK (true);