-- Create a public storage bucket for invoice photos.
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoice-photos', 'invoice-photos', true)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public;

-- Allow authenticated users to view invoice photos.
DROP POLICY IF EXISTS "Authenticated users can view invoice photos" ON storage.objects;
CREATE POLICY "Authenticated users can view invoice photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'invoice-photos');

-- Allow users to upload only into their own folder prefix.
DROP POLICY IF EXISTS "Users can upload own invoice photos" ON storage.objects;
CREATE POLICY "Users can upload own invoice photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'invoice-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update files within their own folder prefix.
DROP POLICY IF EXISTS "Users can update own invoice photos" ON storage.objects;
CREATE POLICY "Users can update own invoice photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'invoice-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'invoice-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete files within their own folder prefix.
DROP POLICY IF EXISTS "Users can delete own invoice photos" ON storage.objects;
CREATE POLICY "Users can delete own invoice photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'invoice-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
