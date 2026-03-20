CREATE TABLE public.cart_reminder_tracking (
  user_id             UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  last_cart_activity  TIMESTAMPTZ,
  reminders_sent      INT DEFAULT 0,
  last_reminder_at    TIMESTAMPTZ
);
