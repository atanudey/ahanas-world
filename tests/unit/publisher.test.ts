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
    existingPosts: [] as { platform: string; status: string; created_at?: string }[],
    deletes: [] as string[],
  },
}));

// Minimal chainable Supabase stub covering the calls publisher.ts makes.
vi.mock('@/lib/supabase/server', () => {
  function makeQuery(table: string) {
    const api: Record<string, unknown> = {};
    let deleting = false;
    let filterPlatform: string | null = null;
    api.select = () => api;
    api.eq = (col: string, val: string) => {
      if (col === 'platform') filterPlatform = val;
      return api;
    };
    api.in = () => api;
    api.neq = () => api;
    api.update = () => api;
    api.delete = () => {
      deleting = true;
      return api;
    };
    // Awaiting a non-.single() query (existing posts lookup / delete).
    api.then = (resolve: (v: unknown) => void) => {
      if (deleting) state.deletes.push(filterPlatform ?? '');
      resolve({ data: table === 'social_posts' && !deleting ? state.existingPosts : null, error: null });
    };
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
  return {
    createSupabaseAdmin: () => ({
      from: (table: string) => makeQuery(table),
      storage: {
        from: () => ({
          createSignedUrl: async (path: string) => ({
            data: { signedUrl: `https://cdn.test/signed/${path}` },
            error: null,
          }),
        }),
      },
    }),
  };
});

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
    state.existingPosts = [];
    state.deletes = [];
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
    // Platforms get a signed URL, not a link into the (private) bucket.
    expect(facebookPublish.mock.calls[0][0].mediaUrl).toBe('https://cdn.test/signed/art/1/x.jpg');
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

  it('on retry, only re-attempts platforms that did not already publish', async () => {
    state.content = { id: '5', type: 'art', media_type: 'image/jpeg', media_path: 'art/5/x.jpg', title: 'T' };
    state.settings = allEnabled;
    state.existingPosts = [
      { platform: 'facebook', status: 'published' },
      { platform: 'instagram', status: 'failed' },
    ];

    const { publishToSocialMedia } = await import('@/lib/social/publisher');
    const result = await publishToSocialMedia('5');

    expect(facebookPublish).not.toHaveBeenCalled();
    expect(instagramPublish).toHaveBeenCalledTimes(1);
    expect(result.published).toEqual(['instagram']);
    // The stale failed Instagram row is cleared before the new attempt.
    expect(state.deletes).toEqual(['instagram']);
  });

  it('retries a stale "publishing" row but leaves a fresh one alone', async () => {
    state.content = { id: '7', type: 'art', media_type: 'image/jpeg', media_path: 'art/7/x.jpg', title: 'T' };
    state.settings = allEnabled;
    state.existingPosts = [
      { platform: 'facebook', status: 'publishing', created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
      { platform: 'instagram', status: 'publishing', created_at: new Date().toISOString() },
    ];

    const { publishToSocialMedia } = await import('@/lib/social/publisher');
    const result = await publishToSocialMedia('7');

    expect(facebookPublish).toHaveBeenCalledTimes(1); // crashed 30 min ago → retried
    expect(instagramPublish).not.toHaveBeenCalled(); // still in progress → untouched
    expect(result.published).toEqual(['facebook']);
    expect(state.deletes).toEqual(['facebook']);
  });

  it('records a skipped row for a platform turned off in settings', async () => {
    state.content = { id: '8', type: 'art', media_type: 'image/jpeg', media_path: 'art/8/x.jpg', title: 'T' };
    state.settings = { ...allEnabled, instagram_enabled: false };

    const { publishToSocialMedia } = await import('@/lib/social/publisher');
    await publishToSocialMedia('8');

    const igRow = state.inserts.find((r) => r.platform === 'instagram');
    expect(igRow?.status).toBe('skipped');
    expect(String(igRow?.error_message)).toMatch(/turned off/);
  });

  it('skips audio instead of sending it to video-only endpoints', async () => {
    state.content = { id: '6', type: 'song', media_type: 'audio/webm', media_path: 'song/6/x.webm', title: 'T' };
    state.settings = allEnabled;

    const { publishToSocialMedia } = await import('@/lib/social/publisher');
    const result = await publishToSocialMedia('6');

    expect(facebookPublish).not.toHaveBeenCalled();
    expect(instagramPublish).not.toHaveBeenCalled();
    expect(result.published).toEqual([]);
    expect(result.failed).toEqual([]);
    expect(result.skipped.sort()).toEqual(['facebook', 'instagram', 'youtube']);
    expect(state.inserts.every((r) => r.status === 'skipped')).toBe(true);
  });
});
