insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values 
    ('product_images', 'product_images', true, null, null),
    ('product_videos', 'product_videos', true, null, null),
    ('complaint_images', 'complaint_images', true, null, null),
    ('toolbox_talk_pdfs', 'toolbox_talk_pdfs', true, null, null),
    ('ehs', 'ehs', true, null, null)
on conflict (id) do update 
    set public = EXCLUDED.public,
        updated_at = now();

-- Policies for product videos
CREATE POLICY "Allow all users to have read access to product videos"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'product_videos' 
    AND (storage.foldername(name))[1] = 'videos'
);

CREATE POLICY "Allow authenticated users to insert into product_videos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product_videos');

-- Policies for product images
CREATE POLICY "Allow any user to read from images folder in product_images"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'product_images' 
    AND (storage.foldername(name))[1] = 'images'
);

CREATE POLICY "Allow authenticated users to insert only into images folder in product_images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'product_images' 
    AND (storage.foldername(name))[1] = 'images'
);

-- Policies for complaint images
CREATE POLICY "Allow any user to read from images folder in complaint_images"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'complaint_images' 
    AND (storage.foldername(name))[1] = 'images'
);

CREATE POLICY "Allow authenticated users to insert into images folder in complaint_images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'complaint_images' 
    AND (storage.foldername(name))[1] = 'images'
);

-- Policies for toolbox talk PDFs
CREATE POLICY "Allow authenticated users to insert PDFs only in public folder of toolbox_talk_pdfs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = ANY (ARRAY['toolbox_talk_pdfs'::text]) 
    AND (storage.foldername(name))[1] = ANY (ARRAY['pdfs'::text])
);

CREATE POLICY "Allow authenticated users to read & insert in pdfs folder of toolbox_talk_pdfs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'toolbox_talk_pdfs' 
    AND (storage.foldername(name))[1] = 'pdfs'
);

--Policies for ehs incident analysis
CREATE POLICY "Allow authenticated users to upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    (bucket_id = 'ehs'::text) AND (storage.foldername(name))[1] = ANY (ARRAY['img'::text])
);

CREATE POLICY "Allow authenticated users to update images"
ON storage.objects
FOR UPDATE   
TO authenticated
USING (((auth.uid() = owner) AND (bucket_id = 'ehs'::text)))
WITH CHECK (((auth.uid() = owner) AND (bucket_id = 'ehs'::text)));