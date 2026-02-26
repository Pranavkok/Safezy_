ALTER TABLE public.blog_subscribers
    DROP CONSTRAINT IF EXISTS blog_subscribers_blog_id_fkey,
    DROP CONSTRAINT IF EXISTS blog_subscribers_email_blog_unique;

ALTER TABLE public.blog_subscribers
    DROP COLUMN IF EXISTS blog_id;

ALTER TABLE public.blog_subscribers
    ADD CONSTRAINT blog_subscribers_email_unique UNIQUE (subscriber_email);
