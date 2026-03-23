-- Insert new roles into user_roles lookup table
-- (must be in a separate transaction from the ALTER TYPE ADD VALUE above)
INSERT INTO public.user_roles ("role")
VALUES
  ('manager'),
  ('safety_officer');

-- ─────────────────────────────────────────────────────────────────────────────
-- ehs_ua_uc_near_miss
-- Add assignment fields + expand status to 3 values (Open | Assigned | Closed)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.ehs_ua_uc_near_miss
  ADD COLUMN IF NOT EXISTS "assigned_to_user_id" uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS "assigned_to_name"    text;

-- status column is plain TEXT with no existing check constraint — comment updated:
-- Valid values: 'Open' | 'Assigned' | 'Closed'
COMMENT ON COLUMN public.ehs_ua_uc_near_miss.status
  IS 'Open | Assigned | Closed';

-- Index for fast lookups by assigned officer
CREATE INDEX IF NOT EXISTS idx_ehs_ua_uc_near_miss_assigned_to
  ON public.ehs_ua_uc_near_miss (assigned_to_user_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- ehs_incident_analysis
-- Add assignment fields only.
-- Status is derived: is_completed=false + no assigned_to = Open
--                    is_completed=false + assigned_to set  = Assigned
--                    is_completed=true                     = Closed
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.ehs_incident_analysis
  ADD COLUMN IF NOT EXISTS "assigned_to_user_id" uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS "assigned_to_name"    text;

-- Index for fast lookups by assigned officer
CREATE INDEX IF NOT EXISTS idx_ehs_incident_analysis_assigned_to
  ON public.ehs_incident_analysis (assigned_to_user_id);
