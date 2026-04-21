-- Add a dedicated field for initial investigation findings in incident analysis

ALTER TABLE ehs_incident_analysis
  ADD COLUMN IF NOT EXISTS initial_investigation_findings TEXT DEFAULT NULL;
