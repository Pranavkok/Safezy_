CREATE TYPE public.notification_type AS ENUM (
  'registration',
  'toolbox_talk_completion',
  'checklist_submission',
  'incident_report',
  'cart_reminder',
  'portal_news',
  'portal_toolbox_talk',
  'portal_checklist'
);

CREATE TABLE public.notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type        public.notification_type NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  url         TEXT,
  data        JSONB DEFAULT '{}',
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = FALSE;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user reads own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user marks own notifications read"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "service role inserts notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);
