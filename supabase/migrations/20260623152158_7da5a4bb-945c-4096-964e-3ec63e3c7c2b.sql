
DROP POLICY IF EXISTS "Users upload to own folder broadcast-media" ON storage.objects;
DROP POLICY IF EXISTS "Users read own folder broadcast-media" ON storage.objects;
DROP POLICY IF EXISTS "Users update own folder broadcast-media" ON storage.objects;
DROP POLICY IF EXISTS "Users delete own folder broadcast-media" ON storage.objects;

CREATE POLICY "Users upload to own folder broadcast-media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'broadcast-media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users read own folder broadcast-media"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'broadcast-media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users update own folder broadcast-media"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'broadcast-media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users delete own folder broadcast-media"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'broadcast-media' AND (storage.foldername(name))[1] = auth.uid()::text);
