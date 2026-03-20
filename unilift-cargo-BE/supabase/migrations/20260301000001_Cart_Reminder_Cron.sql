-- Enable required extensions (one-time, safe to re-run)
-- NOTE: pg_cron and pg_net are only available on the remote Supabase project,
--       not on local dev. Run this in Supabase Studio → SQL Editor on production.
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule cart reminders: daily at 9:00 AM UTC
-- Replace <CRON_SECRET> with the value of CRON_SECRET from .env
SELECT cron.schedule(
  'cart-reminders-daily',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url     := 'https://uniliftcargo.com/api/cron/cart-reminders?secret=39db38e967d124197a83c618cd1f65abb21ff117fb7925e2b556f0e564c811fd',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body    := '{}'::jsonb
  );
  $$
);
