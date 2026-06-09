import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Tests for publishToSocialMedia — the orchestrator that decides which
 * platforms a piece of content goes to, filters by enabled settings + token
 * configuration, and records the outcome. Supabase and the platform clients are
 * mocked so we can assert the routing/branching without any network or DB.
 */

const { state } = vi.hoisted(() => ({
  state: {
    content: null as Record<string, unknown> | null,
    settings: null as Record<string, unknown> | null,
    inserts: [] as Record<string, unknown>[],
  },
}));

// Minimal chainable Supabase stub covering the calls publisher.ts makes.
vi.mock('@/lib/supabase/server', () => {
  function makeQuery(table: string) {
    const api: Record<string, unknown> = {};
    api.select = () => api;
    api.eq = () => api;
    api.update = () => api;
    api.single = async () => {
      if (table === 'content') return { data: state.content, error: null };
      if (table === 'parent_settings') return { data: state.settings, error: null };
      return { data: { id: `post-${state.inserts.length}` }, error: null };
    };
    api.insert = (row: Record<string, unknown>) => {
      state.inserts.push({ table, ...row });
      return api;
    };
    return api;
  }
  return { createSupabaseAdmin: () => ({ from: (table: string) => makeQuery(table) }) };
});

vi.mock('@/lib/utils/storage', () => ({
  getMediaUrl: (path: string) => `https://cdn.test/${path}`,
}));

const facebookPublish = vi.fn();
const instagramPublish = vi.fn();
const youtubePublish = vi.fn();

vi.mock('@/lib/social/facebook', () => ({
  facebookClient: {
    isConfigured: () => true,
    publish: (...args: unknown[]) => facebookPublish(...args),
  },
}));
vi.mock('@/lib/social/instagram', () => ({
  instagramClient: {
    isConfigured: () => true,
    publish: (...args: unknown[]) => instagramPublish(...args),
  },
}));
vi.mock('@/lib/social/youtube', () => ({
  youtubeClient: {
    // Not connected — should be skipped, never published.
    isConfigured: () => false,
    publish: (...args: unknown[]) => youtubePublish(...args),
  },
}));

const allEnabled = {
  facebook_enabled: true,
  instagram_enabled: true,
  youtube_enabled: true,
  facebook_access_token: 'fa',
  facebook_page_id: 'fp',
  instagram_account_id: 'ig',
  youtube_refresh_token: 'yt',
  youtube_channel_id: 'yc',
};

describe('publishToSocialMedia', () => {
  beforeEach(() => {
    state.content = null;
    state.settings = null;
    state.inserts = [];
    facebookPublish.mockReset().mockResolvedValue({ success: true, platformPostId: 'p', platformUrl: 'u' });
    instagramPublish.mockReset().mockResolvedValue({ success: true, platformPostId: 'p', platformUrl: 'u' });
    youtubePublish.mockReset().mockResolvedValue({ success: true });
  });

  it('throws when the content does not exist', async () => {
    state.content = null;
    const { publishToSocialMedia } = await import('@/lib/social/publisher');
    await expect(publishToSocialMedia('missing')).rejects.toThrow(/content not found/i);
  });

  it('routes an image to Facebook + Instagram only (no YouTube)', async () => {
    state.content = { id: '1', type: 'art', media_type: 'image/jpeg', media_path: 'art/1/x.jpg', title: 'T' };
    state.settings = allEnabled;

    const { publishToSocialMedia } = await import('@/lib/social/publisher');
    const result = await publishToSocialMedia('1');

    expect(result.published.sort()).toEqual(['facebook', 'instagram']);
    expect(result.skipped).not.toContain('facebook');
    expect(youtubePublish).not.toHaveBeenCalled();
    expect(facebookPublish).toHaveBeenCalledTimes(1);
  });

  it('skips text-only content with no media path', async () => {
    state.content = { id: '2', type: 'reading', media_type: 'text/plain', media_path: null, title: 'T' };
    state.settings = allEnabled;

    const { publishToSocialMedia } = await import('@/lib/social/publisher');
    const result = await publishToSocialMedia('2');

    expect(result.published).toEqual([]);
    expect(result.skipped).toEqual(expect.arrayContaining(['facebook', 'instagram']));
    expect(facebookPublish).not.toHaveBeenCalled();
  });

  it('records a failed platform when its client publish fails', async () => {
    state.content = { id: '3', type: 'art', media_type: 'image/jpeg', media_path: 'art/3/x.jpg', title: 'T' };
    state.settings = allEnabled;
    instagramPublish.mockResolvedValue({ success: false, error: 'boom' });

    const { publishToSocialMedia } = await import('@/lib/social/publisher');
    const result = await publishToSocialMedia('3');

    expect(result.published).toEqual(['facebook']);
    expect(result.failed).toEqual(['instagram']);
  });

  it('does not publish to platforms disabled in settings', async () => {
    state.content = { id: '4', type: 'video', media_type: 'video/mp4', media_path: 'video/4/x.mp4', title: 'T' };
    state.settings = { ...allEnabled, instagram_enabled: false };

    const { publishToSocialMedia } = await import('@/lib/social/publisher');
    const result = await publishToSocialMedia('4');

    expect(instagramPublish).not.toHaveBeenCalled();
    expect(result.skipped).toContain('instagram'); // disabled
    expect(result.skipped).toContain('youtube'); // not configured
    expect(result.published).toEqual(['facebook']);
  });
});
