/**
 * Media lives in private Supabase Storage buckets (migration 006). These
 * helpers return app URLs: /api/files checks who may see the file and then
 * redirects to a short-lived signed URL. Use them for anything a browser loads.
 *
 * Server code that needs a URL another service can fetch (social publishing)
 * should create a signed URL directly with the service-role client instead.
 */

type Bucket = 'media' | 'thumbnails';

function fileUrl(bucket: Bucket, path: string): string {
  const encoded = path.split('/').map(encodeURIComponent).join('/');
  return `/api/files/${bucket}/${encoded}`;
}

export function getMediaUrl(path: string): string {
  return fileUrl('media', path);
}

export function getThumbnailUrl(path: string): string {
  return fileUrl('thumbnails', path);
}
