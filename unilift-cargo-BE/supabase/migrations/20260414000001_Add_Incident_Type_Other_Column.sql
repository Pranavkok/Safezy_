-- Add missing incident_type_other column to ehs_incident_analysis

ALTER TABLE public.ehs_incident_analysis
  ADD COLUMN IF NOT EXISTS "incident_type_other" TEXT DEFAULT NULL;
