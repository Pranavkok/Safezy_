-- Add reported_by_user_id to ehs_incident_analysis so users can list their own reports

ALTER TABLE public.ehs_incident_analysis
  ADD COLUMN IF NOT EXISTS "reported_by_user_id" uuid REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_ehs_incident_analysis_reported_by
  ON public.ehs_incident_analysis (reported_by_user_id);
