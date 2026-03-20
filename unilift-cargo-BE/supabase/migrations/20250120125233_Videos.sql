CREATE TABLE public.videos (
    "id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "video_url" varchar NOT NULL,
    "incident_analysis_id" bigint,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT fk_incident_analysis FOREIGN KEY ("incident_analysis_id") REFERENCES public.ehs_incident_analysis ("id")
);

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;