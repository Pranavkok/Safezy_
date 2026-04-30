-- New notification types for PPE expiry
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'ppe_expired';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'ppe_expiry_warning';

-- Track whether expiry notifications have been sent per assignment
ALTER TABLE public.admin_ppe_assignments
  ADD COLUMN IF NOT EXISTS expiry_notified  BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS warning_notified BOOLEAN NOT NULL DEFAULT FALSE;

-- Schedule daily PPE expiry check at 7:00 AM UTC
-- Replace <CRON_SECRET> with the actual CRON_SECRET value before running
SELECT cron.schedule(
  'ppe-expiry-daily',
  '0 7 * * *',
  $$
  SELECT net.http_post(
    url     := 'https://uniliftcargo.com/api/cron/ppe-expiry?secret=39db38e967d124197a83c618cd1f65abb21ff117fb7925e2b556f0e564c811fd',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body    := '{}'::jsonb
  );
  $$
);
