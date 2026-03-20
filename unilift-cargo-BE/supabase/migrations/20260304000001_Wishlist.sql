CREATE TABLE public.wishlist (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES public.users(id)   ON DELETE CASCADE,
  product_id  UUID        NOT NULL REFERENCES public.product(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT wishlist_unique UNIQUE (user_id, product_id)
);

CREATE INDEX idx_wishlist_user_id ON public.wishlist(user_id);

ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- Contractors can read their own wishlist
CREATE POLICY "user reads own wishlist"
  ON public.wishlist FOR SELECT
  USING (auth.uid() = (SELECT auth_id FROM public.users WHERE id = user_id));

-- Only contractors can add items
CREATE POLICY "contractor inserts own wishlist"
  ON public.wishlist FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT auth_id FROM public.users WHERE id = user_id)
    AND auth.jwt() ->> 'user_role' = 'contractor'
  );

-- Users can only delete their own wishlist items
CREATE POLICY "user deletes own wishlist"
  ON public.wishlist FOR DELETE
  USING (auth.uid() = (SELECT auth_id FROM public.users WHERE id = user_id));
