-- Toolbox Talk images are uploaded to toolbox_talk_pdfs/images, while the
-- original policies only covered the legacy pdfs folder.
CREATE POLICY "Allow authenticated users to upload toolbox talk images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'toolbox_talk_pdfs'
  AND (storage.foldername(name))[1] = 'images'
);

CREATE POLICY "Allow public read access to toolbox talk images"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'toolbox_talk_pdfs'
  AND (storage.foldername(name))[1] = 'images'
);
