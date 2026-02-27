
-- Create storage bucket for broadcast media
INSERT INTO storage.buckets (id, name, public) VALUES ('broadcast-media', 'broadcast-media', true);

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'broadcast-media' AND auth.uid() IS NOT NULL);

-- Allow public read access
CREATE POLICY "Public read access for broadcast media"
ON storage.objects FOR SELECT
USING (bucket_id = 'broadcast-media');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own media"
ON storage.objects FOR DELETE
USING (bucket_id = 'broadcast-media' AND auth.uid() IS NOT NULL);
