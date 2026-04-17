ALTER TABLE public.ehs_ua_uc_near_miss
  ADD COLUMN IF NOT EXISTS closure_image_url text NULL;

ALTER TABLE public.ehs_incident_analysis
  ADD COLUMN IF NOT EXISTS closure_image_url text NULL;
