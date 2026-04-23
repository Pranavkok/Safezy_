DO $$
BEGIN
  CREATE TYPE public.ehs_suggestion_review_status AS ENUM (
    'pending',
    'completed',
    'rejected'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TYPE public.notification_type
  ADD VALUE IF NOT EXISTS 'checklist_suggestion_completed';

ALTER TYPE public.notification_type
  ADD VALUE IF NOT EXISTS 'checklist_suggestion_rejected';

ALTER TABLE public.ehs_suggestions
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS review_status public.ehs_suggestion_review_status NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_ehs_suggestions_type_status_created_at
  ON public.ehs_suggestions (suggestion_type, review_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ehs_suggestions_user_id
  ON public.ehs_suggestions (user_id);

CREATE POLICY "Enable read access to suggestion owners"
ON public.ehs_suggestions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
