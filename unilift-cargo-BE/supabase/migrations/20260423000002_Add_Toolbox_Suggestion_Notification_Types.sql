ALTER TYPE public.notification_type
  ADD VALUE IF NOT EXISTS 'toolbox_suggestion_completed';

ALTER TYPE public.notification_type
  ADD VALUE IF NOT EXISTS 'toolbox_suggestion_rejected';
