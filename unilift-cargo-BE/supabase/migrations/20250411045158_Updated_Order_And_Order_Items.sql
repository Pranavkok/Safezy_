ALTER TABLE public."order"
ADD COLUMN "order_details" jsonb;

ALTER TABLE public.order_items
ADD COLUMN "order_item_details" jsonb;