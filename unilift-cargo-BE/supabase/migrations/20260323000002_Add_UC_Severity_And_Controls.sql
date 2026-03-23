-- Add UC-specific fields: risk severity and temporary controls applied

ALTER TABLE public.ehs_ua_uc_near_miss
  ADD COLUMN IF NOT EXISTS "uc_severity"           text,
  ADD COLUMN IF NOT EXISTS "uc_temporary_controls" text;
