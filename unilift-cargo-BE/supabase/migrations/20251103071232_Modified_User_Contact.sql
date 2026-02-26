ALTER TABLE public.users
ADD CONSTRAINT users_contact_number_unique UNIQUE (contact_number);