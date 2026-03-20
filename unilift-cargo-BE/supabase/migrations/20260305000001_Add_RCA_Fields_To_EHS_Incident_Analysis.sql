ALTER TABLE public.ehs_incident_analysis
  ADD COLUMN "immediate_cause"      text,
  ADD COLUMN "contributing_factors" jsonb,
  ADD COLUMN "root_causes"          jsonb,
  ADD COLUMN "system_gaps"          text[],
  ADD COLUMN "rca_conclusion"       text;
