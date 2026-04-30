ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'ppe_assigned';

CREATE TABLE public.admin_ppe_assignments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id    UUID NOT NULL REFERENCES public.product(id) ON DELETE CASCADE,
  quantity      INTEGER NOT NULL CHECK (quantity > 0),
  assigned_by   UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  is_deleted    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_apa_contractor_id ON public.admin_ppe_assignments(contractor_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_apa_product_id    ON public.admin_ppe_assignments(product_id);

ALTER TABLE public.admin_ppe_assignments ENABLE ROW LEVEL SECURITY;

-- Contractor reads only their own active assignments
CREATE POLICY "contractor reads own ppe assignments"
  ON public.admin_ppe_assignments
  FOR SELECT
  USING (is_deleted = FALSE AND contractor_id = auth.uid());
