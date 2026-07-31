-- Store shared Corrective and Preventive Action (CAPA) points for
-- Unsafe Act, Unsafe Condition, and Near Miss reports.
ALTER TABLE public.ehs_ua_uc_near_miss
ADD COLUMN IF NOT EXISTS capa_points jsonb;
