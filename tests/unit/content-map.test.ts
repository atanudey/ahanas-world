import { describe, it, expect } from 'vitest';
import { mapContentRow, type ContentRow } from '@/lib/content/map';

const row: ContentRow = {
  id: 'abc',
  type: 'song',
  title: 'Stars',
  slug: 'stars-1234',
  description: null,
  story: 'Hummed for days',
  category: 'Audio Recording',
  medium: null,
  status: 'published',
  visibility: 'public',
  sections: ['home', 'music'],
  media_path: 'song/abc/capture.webm',
  thumbnail_path: 'abc/thumb.jpg',
  media_type: 'audio/webm',
  duration_ms: 12000,
  views: null,
  created_at: '2026-01-02T10:00:00.000Z',
  published_at: '2026-01-05T08:30:00.000Z',
};

describe('mapContentRow', () => {
  it('maps a database row to a ContentItem with app file URLs', () => {
    const item = mapContentRow(row);
    expect(item).toMatchObject({
      id: 'abc',
      type: 'song',
      slug: 'stars-1234',
      date: '2026-01-05',
      description: '',
      medium: '',
      views: 0,
      sections: ['home', 'music'],
      thumbnail: '/api/files/thumbnails/abc/thumb.jpg',
      mediaUrl: '/api/files/media/song/abc/capture.webm',
      mediaType: 'audio/webm',
      durationMs: 12000,
    });
  });

  it('falls back to created_at and leaves media fields empty without files', () => {
    const item = mapContentRow({ ...row, published_at: null, media_path: null, thumbnail_path: null, media_type: null });
    expect(item.date).toBe('2026-01-02');
    expect(item.thumbnail).toBe('');
    expect(item.mediaUrl).toBeUndefined();
    expect(item.mediaType).toBeUndefined();
  });
});
