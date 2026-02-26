ALTER TABLE ehs_incident_analysis
ALTER COLUMN "preventive_actions" TYPE text[] USING string_to_array("preventive_actions", ',');

ALTER TABLE ehs_incident_analysis
ALTER COLUMN "corrective_actions" TYPE text[] USING string_to_array("corrective_actions", ',');

ALTER TABLE ehs_incident_analysis
ADD COLUMN "severity_level" text;