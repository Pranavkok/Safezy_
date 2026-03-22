CREATE TABLE public.ehs_ua_uc_near_miss (
    "id"                    bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "report_no"             text NOT NULL UNIQUE,
    "observation_type"      text NOT NULL,                          -- 'UA' | 'UC' | 'NearMiss'
    "reported_at"           timestamp with time zone NOT NULL DEFAULT now(),
    "location_department"   text NOT NULL,

    -- Reporter (snapshot from user profile at submission time)
    "reported_by_user_id"   uuid REFERENCES auth.users(id),
    "reported_by_name"      text,
    "employee_id"           text,

    -- AI-analyzed fields (Section 3)
    "what_happened"         text,
    "equipment_involved"    text,
    "activity_at_time"      text,

    -- Media
    "media_url"             text,
    "media_type"            text,                                   -- 'image' | 'video' | 'voice'

    -- Classification: UA (Section 4)
    "ua_classifications"    jsonb DEFAULT '[]'::jsonb,
    "ua_other"              text,

    -- Classification: UC (Section 4)
    "uc_classifications"    jsonb DEFAULT '[]'::jsonb,
    "uc_other"              text,

    -- Classification: Near Miss (Section 4)
    "nm_potential_injury"   text,
    "nm_what_could_happen"  text,
    "nm_severity"           text,                                   -- 'Low' | 'Medium' | 'High'

    -- Status & Action (Section 6)
    "status"                text NOT NULL DEFAULT 'Open',           -- 'Open' | 'Closed'
    "action_taken"          text,
    "action_by"             text,
    "action_date"           date,

    "created_at"            timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at"            timestamp with time zone NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_ehs_ua_uc_near_miss_observation_type ON public.ehs_ua_uc_near_miss (observation_type);
CREATE INDEX idx_ehs_ua_uc_near_miss_status ON public.ehs_ua_uc_near_miss (status);
CREATE INDEX idx_ehs_ua_uc_near_miss_reported_by ON public.ehs_ua_uc_near_miss (reported_by_user_id);

-- Row Level Security
ALTER TABLE public.ehs_ua_uc_near_miss ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access to authenticated users only"
ON public.ehs_ua_uc_near_miss
FOR SELECT
TO authenticated
USING ((auth.uid() IS NOT NULL));

CREATE POLICY "Enable insert access to authenticated users only"
ON public.ehs_ua_uc_near_miss
FOR INSERT
TO authenticated
WITH CHECK ((auth.uid() IS NOT NULL));

CREATE POLICY "Enable update access to authenticated users only"
ON public.ehs_ua_uc_near_miss
FOR UPDATE
TO authenticated
USING ((auth.uid() IS NOT NULL))
WITH CHECK ((auth.uid() IS NOT NULL));
