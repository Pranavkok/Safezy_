CREATE TYPE "confirmation" AS ENUM (
    'Yes',
    'No'
);

CREATE TABLE public.ehs_incident_analysis (
    "id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "title" text NOT NULL,
    "narrative" text,
    "investigation_team" jsonb,
    "date" timestamp,
    "location" varchar,
    "affected_entity" jsonb,
    "custom_affected_entity" text,
    "entity_details" jsonb,
    "cause_to_entity" text,
    "entity_shift_start_time" timestamp,
    "entity_shift_end_time" timestamp,
    "witness_name" varchar,
    "witness_designation" varchar,
    "witness_records" "confirmation",
    "process_before_incident" text,
    "team_involved" jsonb,
    "instructions_communicated" "confirmation",
    "tools_involved" jsonb,
    "regular_process" "confirmation",
    "process_frequency" text,
    "is_a_past_incident" "confirmation",
    "past_incident_remarks" text,
    "training_provided" "confirmation",
    "training_remarks" text,
    "evidence_employee_list" jsonb,
    "corrective_actions" text,
    "preventive_actions" text,
    "is_completed" boolean DEFAULT false,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.ehs_incident_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access to authenticated users only"
ON public.ehs_incident_analysis
FOR SELECT
TO authenticated
USING ((auth.uid() IS NOT NULL));

CREATE POLICY "Enable insert access to authenticated users only"
ON public.ehs_incident_analysis
FOR INSERT
TO authenticated
WITH CHECK ((auth.uid() IS NOT NULL));

CREATE POLICY "Enable update access to autheticated users only"
ON public.ehs_incident_analysis
FOR UPDATE
TO authenticated
USING ((auth.uid() IS NOT NULL))
WITH CHECK ((auth.uid() IS NOT NULL));