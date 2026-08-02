-- EHS records store application user IDs (public.users.id), not Auth IDs.
-- Convert any assignments/reporters written under the older auth.users FK
-- before aligning the constraints with the application data model.

ALTER TABLE public.ehs_ua_uc_near_miss
  DROP CONSTRAINT IF EXISTS ehs_ua_uc_near_miss_assigned_to_user_id_fkey,
  DROP CONSTRAINT IF EXISTS ehs_ua_uc_near_miss_reported_by_user_id_fkey;

ALTER TABLE public.ehs_incident_analysis
  DROP CONSTRAINT IF EXISTS ehs_incident_analysis_assigned_to_user_id_fkey,
  DROP CONSTRAINT IF EXISTS ehs_incident_analysis_reported_by_user_id_fkey;

UPDATE public.ehs_ua_uc_near_miss AS report
SET assigned_to_user_id = app_user.id
FROM public.users AS app_user
WHERE report.assigned_to_user_id = app_user.auth_id;

UPDATE public.ehs_ua_uc_near_miss AS report
SET reported_by_user_id = app_user.id
FROM public.users AS app_user
WHERE report.reported_by_user_id = app_user.auth_id;

UPDATE public.ehs_incident_analysis AS incident
SET assigned_to_user_id = app_user.id
FROM public.users AS app_user
WHERE incident.assigned_to_user_id = app_user.auth_id;

UPDATE public.ehs_incident_analysis AS incident
SET reported_by_user_id = app_user.id
FROM public.users AS app_user
WHERE incident.reported_by_user_id = app_user.auth_id;

ALTER TABLE public.ehs_ua_uc_near_miss
  ADD CONSTRAINT ehs_ua_uc_near_miss_assigned_to_user_id_fkey
    FOREIGN KEY (assigned_to_user_id) REFERENCES public.users(id),
  ADD CONSTRAINT ehs_ua_uc_near_miss_reported_by_user_id_fkey
    FOREIGN KEY (reported_by_user_id) REFERENCES public.users(id);

ALTER TABLE public.ehs_incident_analysis
  ADD CONSTRAINT ehs_incident_analysis_assigned_to_user_id_fkey
    FOREIGN KEY (assigned_to_user_id) REFERENCES public.users(id),
  ADD CONSTRAINT ehs_incident_analysis_reported_by_user_id_fkey
    FOREIGN KEY (reported_by_user_id) REFERENCES public.users(id);
