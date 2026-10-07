import type { ContentItem, ContentStatus, ContentType, SectionId, Visibility } from '@/lib/constants';
import { getMediaUrl, getThumbnailUrl } from '@/lib/utils/storage';

/** A row of the `content` table, as supabase-js returns it. */
export interface ContentRow {
  id: string;
  type: string;
  title: string;
  slug: string;
  description: string | null;
  story: string | null;
  category: string | null;
  medium: string | null;
  status: string;
  visibility: string;
  sections: string[] | null;
  media_path: string | null;
  thumbnail_path: string | null;
  media_type: string | null;
  duration_ms: number | null;
  views: number | null;
  created_at: string;
  published_at: string | null;
}

/** Shape a database row like the ContentItem the public components render. */
export function mapContentRow(row: ContentRow): ContentItem {
  const date = row.published_at ?? row.created_at ?? '';
  return {
    id: row.id,
    type: row.type as ContentType,
    title: row.title,
    slug: row.slug,
    date: date.slice(0, 10),
    category: row.category ?? '',
    views: row.views ?? 0,
    status: row.status as ContentStatus,
    visibility: row.visibility as Visibility,
    sections: (row.sections ?? []) as SectionId[],
    thumbnail: row.thumbnail_path ? getThumbnailUrl(row.thumbnail_path) : '',
    description: row.description ?? '',
    story: row.story ?? '',
    platforms: [],
    medium: row.medium ?? '',
    mediaUrl: row.media_path ? getMediaUrl(row.media_path) : undefined,
    mediaType: row.media_type ?? undefined,
    durationMs: row.duration_ms ?? undefined,
  };
}
