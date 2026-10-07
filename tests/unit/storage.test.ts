import { describe, it, expect } from 'vitest';
import { getMediaUrl, getThumbnailUrl } from '@/lib/utils/storage';

/**
 * Media URLs point at the app's /api/files route (which checks access and
 * redirects to a signed URL), never directly at the storage buckets.
 */
describe('Storage URL utilities', () => {
  it('getMediaUrl uses the media bucket route', () => {
    expect(getMediaUrl('song/456/capture.mp3')).toBe('/api/files/media/song/456/capture.mp3');
  });

  it('getThumbnailUrl uses the thumbnails bucket route', () => {
    expect(getThumbnailUrl('123/thumb.jpg')).toBe('/api/files/thumbnails/123/thumb.jpg');
  });

  it('encodes path segments that need it', () => {
    expect(getMediaUrl('art/a b/c#1.png')).toBe('/api/files/media/art/a%20b/c%231.png');
  });
});
