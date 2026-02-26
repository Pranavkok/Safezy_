-- Create the 'blogs' bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('blogs', 'blogs', true, null, null)
ON CONFLICT (id) DO UPDATE 
    SET public = EXCLUDED.public,
        updated_at = now();

-- SELECT policy: Allow any user to read from images folder in 'blogs'
CREATE POLICY "Allow any user to read from images folder in blogs"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'blogs' 
    AND (storage.foldername(name))[1] = 'images'
);

-- INSERT policy: Allow authenticated users to insert into images folder in 'blogs'
CREATE POLICY "Allow authenticated users to insert into images folder in blogs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'blogs' 
    AND (storage.foldername(name))[1] = 'images'
);

-- UPDATE policy: Allow authenticated users to update images in 'blogs'
CREATE POLICY "Allow authenticated users to update images in blogs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'blogs'
    AND (storage.foldername(name))[1] = 'images'
    AND auth.uid() = owner
)
WITH CHECK (
    bucket_id = 'blogs'
    AND (storage.foldername(name))[1] = 'images'
    AND auth.uid() = owner
);

-- DELETE policy: Allow authenticated users to delete images in 'blogs'
CREATE POLICY "Allow authenticated users to delete images in blogs"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'blogs'
    AND (storage.foldername(name))[1] = 'images'
    AND auth.uid() = owner
);
