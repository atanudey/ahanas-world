import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the env var before importing
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test-project.supabase.co');

// Dynamic import after env stub
const { getPublicUrl, getMediaUrl, getThumbnailUrl, getOptimizedImageUrl } = await import('@/lib/utils/storage');

describe('Storage URL utilities', () => {
  it('getPublicUrl builds correct URL', () => {
    expect(getPublicUrl('media', 'art/123/capture.jpg')).toBe(
      'https://test-project.supabase.co/storage/v1/object/public/media/art/123/capture.jpg'
    );
  });

  it('getMediaUrl uses media bucket', () => {
    expect(getMediaUrl('song/456/capture.mp3')).toBe(
      'https://test-project.supabase.co/storage/v1/object/public/media/song/456/capture.mp3'
    );
  });

  it('getThumbnailUrl uses thumbnails bucket', () => {
    expect(getThumbnailUrl('123/thumb.jpg')).toBe(
      'https://test-project.supabase.co/storage/v1/object/public/thumbnails/123/thumb.jpg'
    );
  });

  it('getOptimizedImageUrl builds render URL with params', () => {
    const url = getOptimizedImageUrl('art/123/capture.jpg', 800, 75);
    expect(url).toBe(
      'https://test-project.supabase.co/storage/v1/render/image/public/media/art/123/capture.jpg?width=800&quality=75'
    );
  });

  it('getOptimizedImageUrl defaults quality to 80', () => {
    const url = getOptimizedImageUrl('art/123/capture.jpg', 640);
    expect(url).toContain('quality=80');
  });
});
