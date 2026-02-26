ALTER TABLE public."order"
DROP COLUMN "address_id";

ALTER TABLE public."order"
ADD COLUMN "worksite_id" uuid REFERENCES public.worksite(id);
