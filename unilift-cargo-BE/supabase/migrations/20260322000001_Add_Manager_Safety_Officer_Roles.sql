-- Add manager and safety_officer to the app_role enum
-- NOTE: INSERT using the new values must be in a separate migration (different transaction)
ALTER TYPE "app_role" ADD VALUE IF NOT EXISTS 'manager';
ALTER TYPE "app_role" ADD VALUE IF NOT EXISTS 'safety_officer';
