-- Storage bucket for UA / UC / Near Miss media (images, videos, voice notes)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'ehs-ua-uc-media',
    'ehs-ua-uc-media',
    true,
    104857600,                          -- 100 MB max (covers video)
    ARRAY[
        'image/jpeg', 'image/png', 'image/webp', 'image/gif',
        'video/mp4', 'video/quicktime', 'video/webm',
        'audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/webm', 'audio/ogg'
    ]
)
ON CONFLICT (id) DO UPDATE
    SET public           = EXCLUDED.public,
        file_size_limit  = EXCLUDED.file_size_limit,
        allowed_mime_types = EXCLUDED.allowed_mime_types,
        updated_at       = now();

-- Allow authenticated users to upload media
CREATE POLICY "Allow authenticated users to upload UA UC media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ehs-ua-uc-media');

-- Allow authenticated users to read media
CREATE POLICY "Allow authenticated users to read UA UC media"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'ehs-ua-uc-media');

-- Allow public read (so media URLs work in report viewer without auth)
CREATE POLICY "Allow public read of UA UC media"
ON storage.objects
FOR SELECT
USING (bucket_id = 'ehs-ua-uc-media');
