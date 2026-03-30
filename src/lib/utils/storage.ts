const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

export function getPublicUrl(bucket: string, path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

export function getMediaUrl(path: string): string {
  return getPublicUrl('media', path);
}

export function getThumbnailUrl(path: string): string {
  return getPublicUrl('thumbnails', path);
}

/**
 * Get an optimized image URL using Supabase image transformations.
 * Only works with Supabase Cloud (not self-hosted).
 */
export function getOptimizedImageUrl(path: string, width: number, quality = 80): string {
  return `${SUPABASE_URL}/storage/v1/render/image/public/media/${path}?width=${width}&quality=${quality}`;
}
