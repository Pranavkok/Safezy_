-- Add final approval fields to incident analysis
ALTER TABLE public.ehs_incident_analysis
  ADD COLUMN IF NOT EXISTS final_approval text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS final_approval_remarks text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS final_approval_at timestamptz DEFAULT NULL;

-- Add notification type for incident rejection by admin
ALTER TYPE public.notification_type
  ADD VALUE IF NOT EXISTS 'incident_rejected_by_admin';
