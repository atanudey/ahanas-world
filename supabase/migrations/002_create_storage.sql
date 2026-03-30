-- Create storage buckets for media files
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('thumbnails', 'thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to both buckets
CREATE POLICY "Public read media" ON storage.objects
  FOR SELECT USING (bucket_id IN ('media', 'thumbnails'));

-- Allow service role to upload (handled automatically by service key)
CREATE POLICY "Service upload media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id IN ('media', 'thumbnails'));

CREATE POLICY "Service update media" ON storage.objects
  FOR UPDATE USING (bucket_id IN ('media', 'thumbnails'));

CREATE POLICY "Service delete media" ON storage.objects
  FOR DELETE USING (bucket_id IN ('media', 'thumbnails'));
