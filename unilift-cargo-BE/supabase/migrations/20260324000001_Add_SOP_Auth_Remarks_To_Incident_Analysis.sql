ALTER TABLE public.ehs_incident_analysis
  ADD COLUMN IF NOT EXISTS "sop_deviation_remarks"              text,
  ADD COLUMN IF NOT EXISTS "authorization_competence_remarks"   text;
