ALTER TABLE public.push_subscriptions
  DROP CONSTRAINT push_subscriptions_user_id_fkey;

ALTER TABLE public.push_subscriptions
  ADD CONSTRAINT push_subscriptions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
