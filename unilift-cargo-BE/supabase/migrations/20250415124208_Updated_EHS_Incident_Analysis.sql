ALTER TABLE public.ehs_incident_analysis
ADD COLUMN "entity_shift_details" text,
ADD COLUMN "additional_comments" text;

ALTER TABLE public.ehs_incident_analysis
RENAME COLUMN "entity_shift_start_time" TO "entity_shift_date";

ALTER TABLE public.ehs_incident_analysis
DROP COLUMN "entity_shift_end_time";
