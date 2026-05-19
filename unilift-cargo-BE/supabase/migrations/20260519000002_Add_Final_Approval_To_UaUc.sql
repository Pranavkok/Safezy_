-- Add final approval fields to UA/UC/Near Miss reports
ALTER TABLE public.ehs_ua_uc_near_miss
  ADD COLUMN IF NOT EXISTS final_approval text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS final_approval_remarks text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS final_approval_at timestamptz DEFAULT NULL;

-- Add notification type for UA/UC rejection by admin
ALTER TYPE public.notification_type
  ADD VALUE IF NOT EXISTS 'uauc_rejected_by_admin';
