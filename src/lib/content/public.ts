import { cache } from 'react';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import { MOCK_CONTENT, type ContentItem, type SectionId } from '@/lib/constants';
import { mapContentRow, type ContentRow } from './map';

/**
 * Server-side loaders for the public site.
 *
 * Sample content stands in for the database only outside production, so a dev
 * checkout without Supabase still has something to show. In production an
 * unreachable database means empty pages (and a logged error), never sample
 * creations presented as Ahana's.
 */
const SAMPLES_WHEN_UNAVAILABLE = process.env.NODE_ENV !== 'production';

function isLive(item: ContentItem): boolean {
  return item.status === 'published' && item.visibility === 'public';
}

function inSection(item: ContentItem, section?: SectionId): boolean {
  return !section || item.sections.includes(section);
}

async function fetchPublished(): Promise<ContentItem[]> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .eq('status', 'published')
    .eq('visibility', 'public')
    .order('published_at', { ascending: false, nullsFirst: false });
  if (error) throw error;
  return (data as ContentRow[]).map(mapContentRow);
}

/** Published, public content, newest first — optionally just one section. Cached per request. */
export const getPublishedContent = cache(async (section?: SectionId): Promise<ContentItem[]> => {
  try {
    return (await fetchPublished()).filter((item) => inSection(item, section));
  } catch (err) {
    if (!SAMPLES_WHEN_UNAVAILABLE) {
      console.error('Could not load published content:', err);
      return [];
    }
    return MOCK_CONTENT.filter((item) => isLive(item) && inSection(item, section));
  }
});

/** One published, public item by slug, or null. Cached per request. */
export const getPublishedContentBySlug = cache(async (slug: string): Promise<ContentItem | null> => {
  try {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .eq('visibility', 'public')
      .maybeSingle();
    if (error) throw error;
    return data ? mapContentRow(data as ContentRow) : null;
  } catch (err) {
    if (!SAMPLES_WHEN_UNAVAILABLE) {
      console.error(`Could not load content "${slug}":`, err);
      return null;
    }
    return MOCK_CONTENT.find((item) => item.slug === slug && isLive(item)) ?? null;
  }
});
