ALTER TABLE users
ADD COLUMN role_id bigint REFERENCES user_roles(id);

ALTER TABLE images
ADD COLUMN toolbox_user_id bigint REFERENCES ehs_toolbox_users(id) ON DELETE CASCADE,
ADD COLUMN incident_analysis_id bigint REFERENCES ehs_incident_analysis(id);