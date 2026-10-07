-- Migration 006: Keep media private.
--
-- Both buckets were public, so every capture — including ones still waiting
-- for parent review — could be fetched by anyone who had its path, and the
-- anon role could list object names. Files are now served through the app's
-- /api/files route, which checks that the content is published and public
-- (or that the parent is signed in) before redirecting to a short-lived
-- signed URL. Social publishing signs its own URLs server-side.
--
-- On Supabase Cloud the storage schema is owned by the platform: the bucket
-- update and policy drop work from the SQL editor, and the REVOKE is skipped
-- with a notice if the role lacks permission (anon still can't read objects,
-- because no SELECT policy remains).

UPDATE storage.buckets SET public = false WHERE id IN ('media', 'thumbnails');

DROP POLICY IF EXISTS "Public read media" ON storage.objects;

DO $$
BEGIN
  REVOKE SELECT ON storage.objects FROM anon, authenticated;
EXCEPTION WHEN insufficient_privilege THEN
  RAISE NOTICE 'Skipping REVOKE on storage.objects (insufficient privilege); no anon read policy remains.';
END
$$;
