-- Incident Analysis V3: Add failure_type_other and has_incident_occurred fields

ALTER TABLE ehs_incident_analysis
  ADD COLUMN IF NOT EXISTS failure_type_other TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS has_incident_occurred BOOLEAN DEFAULT NULL;
