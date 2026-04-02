-- Add media_urls and media_types array columns to support multiple media uploads
-- per UA/UC/Near Miss report. Existing single media_url and media_type columns
-- are kept for backwards compatibility.

ALTER TABLE ehs_ua_uc_near_miss
  ADD COLUMN IF NOT EXISTS media_urls  TEXT[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS media_types TEXT[]  DEFAULT '{}';
