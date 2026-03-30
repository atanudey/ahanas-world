'use client';

import { useState, useEffect } from 'react';
import { MOCK_CONTENT, type ContentItem } from '@/lib/constants';
import { getThumbnailUrl } from '@/lib/utils/storage';

/**
 * Fetches published public content from the API.
 * Falls back to MOCK_CONTENT if the API is unavailable (e.g., no Supabase running).
 */
export function usePublicContent(sectionFilter?: string) {
  const [content, setContent] = useState<ContentItem[]>(
    sectionFilter
      ? MOCK_CONTENT.filter((c) => c.visibility === 'public' && c.status === 'published' && c.sections.includes(sectionFilter as ContentItem['sections'][number]))
      : MOCK_CONTENT.filter((c) => c.visibility === 'public' && c.status === 'published'),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchContent() {
      try {
        const res = await fetch('/api/content?status=published&visibility=public');
        if (!res.ok) throw new Error('API error');
        const data = await res.json();

        if (cancelled) return;

        if (data.length > 0) {
          // Map DB records to ContentItem format
          const mapped: ContentItem[] = data.map((item: Record<string, unknown>) => ({
            id: item.id as string,
            type: item.type as ContentItem['type'],
            title: item.title as string,
            slug: item.slug as string,
            date: item.published_at ? new Date(item.published_at as string).toISOString().split('T')[0] : (item.created_at as string),
            category: (item.category as string) || '',
            views: (item.views as number) || 0,
            status: item.status as ContentItem['status'],
            visibility: item.visibility as ContentItem['visibility'],
            sections: (item.sections as string[]) || [],
            thumbnail: item.thumbnail_path ? getThumbnailUrl(item.thumbnail_path as string) : 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600',
            description: (item.description as string) || '',
            story: (item.story as string) || '',
            platforms: [],
            medium: (item.medium as string) || '',
          }));

          const filtered = sectionFilter
            ? mapped.filter((c) => c.sections.includes(sectionFilter as ContentItem['sections'][number]))
            : mapped;

          setContent(filtered.length > 0 ? filtered : content);
        }
      } catch {
        // Keep mock content on failure
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchContent();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionFilter]);

  return { content, loading };
}
