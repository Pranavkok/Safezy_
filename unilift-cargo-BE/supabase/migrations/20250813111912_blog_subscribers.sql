CREATE TABLE public.blog_subscribers (
    "id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "subscriber_email" varchar NOT NULL,
    "blog_id" bigint NOT NULL,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT blog_subscribers_email_blog_unique UNIQUE (subscriber_email, blog_id),
    CONSTRAINT blog_subscribers_blog_id_fkey FOREIGN KEY ("blog_id") REFERENCES public.blogs ("id")
);

ALTER TABLE public.blog_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access to all users"
ON public.blog_subscribers
FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert access to all users"
ON public.blog_subscribers
FOR INSERT
TO public
WITH CHECK (true);


