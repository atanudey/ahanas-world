-- Migration 004: Restrict storage writes to the service role only.
--
-- Migration 002 created INSERT/UPDATE/DELETE policies on storage.objects with a
-- check of `bucket_id IN ('media','thumbnails')` and NO role restriction, which
-- allowed the anon role to upload, overwrite, and delete any object in those
-- buckets. All writes in this app go through the server using the service-role
-- key (which bypasses RLS), so anonymous write access must be removed.
--
-- Dropping the permissive write policies leaves no INSERT/UPDATE/DELETE policy
-- for anon/authenticated => those roles can no longer write. The service role
-- continues to write because BYPASSRLS is set on it (see 000_init_roles.sql).
-- Public SELECT (read) is preserved.

DROP POLICY IF EXISTS "Service upload media" ON storage.objects;
DROP POLICY IF EXISTS "Service update media" ON storage.objects;
DROP POLICY IF EXISTS "Service delete media" ON storage.objects;
