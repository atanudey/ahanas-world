import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { facebookClient } from '@/lib/social/facebook';
import { instagramClient } from '@/lib/social/instagram';
import { youtubeClient } from '@/lib/social/youtube';
import type { PlatformTokens, PublishRequest } from '@/lib/social/types';

// YouTube refreshes a token via getAppCredentials — mock it so no DB/env is needed.
vi.mock('@/lib/credentials', () => ({
  getAppCredentials: vi.fn(async () => ({
    facebookAppId: '',
    facebookAppSecret: '',
    googleClientId: 'gid',
    googleClientSecret: 'gsecret',
    googleRedirectUri: '',
    siteUrl: 'http://localhost:3000',
  })),
}));

/**
 * Tests for the real social platform clients — `isConfigured` gating and the
 * `publish` happy/error paths with a mocked `fetch`. These exercise the actual
 * source (not re-implementations), so they guard against regressions in the
 * Graph API request shape and error handling.
 */

const imageRequest: PublishRequest = {
  contentId: 'c1',
  platform: 'facebook',
  mediaUrl: 'https://example.com/media/photo.jpg',
  mediaType: 'image',
  title: 'My Painting',
  description: 'A watercolor sunrise',
};

describe('facebookClient.isConfigured', () => {
  it('requires both an access token and a page id', () => {
    expect(facebookClient.isConfigured({})).toBe(false);
    expect(facebookClient.isConfigured({ facebook_access_token: 'tok' })).toBe(false);
    expect(facebookClient.isConfigured({ facebook_page_id: 'pid' })).toBe(false);
    expect(
      facebookClient.isConfigured({ facebook_access_token: 'tok', facebook_page_id: 'pid' }),
    ).toBe(true);
  });

  it('treats null tokens as not configured', () => {
    expect(
      facebookClient.isConfigured({ facebook_access_token: null, facebook_page_id: null }),
    ).toBe(false);
  });
});

describe('instagramClient.isConfigured', () => {
  it('requires a facebook access token and an instagram account id', () => {
    expect(instagramClient.isConfigured({})).toBe(false);
    expect(instagramClient.isConfigured({ facebook_access_token: 'tok' })).toBe(false);
    expect(instagramClient.isConfigured({ instagram_account_id: 'iid' })).toBe(false);
    expect(
      instagramClient.isConfigured({ facebook_access_token: 'tok', instagram_account_id: 'iid' }),
    ).toBe(true);
  });
});

describe('facebookClient.publish', () => {
  const tokens: PlatformTokens = {
    facebook_access_token: 'tok',
    facebook_page_id: 'page123',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns an error without attempting a request when not connected', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const result = await facebookClient.publish(imageRequest, {});

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not connected/i);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('posts a photo to the page photos edge and returns the post id', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'mediaId', post_id: 'page123_987' }),
    });
    vi.stubGlobal('fetch', fetchSpy);

    const result = await facebookClient.publish(imageRequest, tokens);

    expect(result.success).toBe(true);
    expect(result.platformPostId).toBe('page123_987');
    expect(result.platformUrl).toBe('https://facebook.com/page123_987');

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toContain('/page123/photos');
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.url).toBe(imageRequest.mediaUrl);
    expect(body.message).toContain('My Painting');
    expect(body.access_token).toBe('tok');
  });

  it('surfaces the Graph API error message on failure', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: { message: 'Invalid OAuth token' } }),
    });
    vi.stubGlobal('fetch', fetchSpy);

    const result = await facebookClient.publish(imageRequest, tokens);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid OAuth token');
  });

  it('routes non-image media to the videos edge', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'vid123' }),
    });
    vi.stubGlobal('fetch', fetchSpy);

    const result = await facebookClient.publish(
      { ...imageRequest, mediaType: 'video', mediaUrl: 'https://example.com/v.mp4' },
      tokens,
    );

    expect(result.success).toBe(true);
    expect(result.platformPostId).toBe('vid123');
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toContain('/page123/videos');
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.file_url).toBe('https://example.com/v.mp4');
  });
});

describe('instagramClient.publish', () => {
  const tokens: PlatformTokens = {
    facebook_access_token: 'tok',
    instagram_account_id: 'ig123',
  };

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('errors without a request when not connected', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const result = await instagramClient.publish(imageRequest, {});

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not connected/i);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('creates a container, polls until FINISHED, then publishes an image', async () => {
    const fetchSpy = vi
      .fn()
      // 1. create media container
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'container1' }) })
      // 2. poll status -> FINISHED
      .mockResolvedValueOnce({ ok: true, json: async () => ({ status_code: 'FINISHED' }) })
      // 3. media_publish
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'post1' }) });
    vi.stubGlobal('fetch', fetchSpy);

    const result = await instagramClient.publish(imageRequest, tokens);

    expect(result.success).toBe(true);
    expect(result.platformPostId).toBe('post1');
    expect(result.platformUrl).toBe('https://instagram.com/p/post1');

    expect(fetchSpy).toHaveBeenCalledTimes(3);
    expect(fetchSpy.mock.calls[0][0]).toContain('/ig123/media');
    const containerBody = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(containerBody.image_url).toBe(imageRequest.mediaUrl);
    expect(containerBody.caption).toContain('#AhanasWorld');
    expect(fetchSpy.mock.calls[2][0]).toContain('/ig123/media_publish');
  });

  it('fails fast when media processing reports ERROR', async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'container1' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ status_code: 'ERROR' }) });
    vi.stubGlobal('fetch', fetchSpy);

    const result = await instagramClient.publish(imageRequest, tokens);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/processing failed/i);
    // Should not have attempted to publish the container.
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('surfaces a container-creation error', async () => {
    const fetchSpy = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: { message: 'Unsupported media' } }),
    });
    vi.stubGlobal('fetch', fetchSpy);

    const result = await instagramClient.publish(imageRequest, tokens);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unsupported media');
  });
});

describe('youtubeClient.isConfigured', () => {
  it('requires a refresh token and a channel id', () => {
    expect(youtubeClient.isConfigured({})).toBe(false);
    expect(youtubeClient.isConfigured({ youtube_refresh_token: 'r' })).toBe(false);
    expect(
      youtubeClient.isConfigured({ youtube_refresh_token: 'r', youtube_channel_id: 'c' }),
    ).toBe(true);
  });
});

describe('youtubeClient.publish', () => {
  const tokens: PlatformTokens = {
    youtube_refresh_token: 'refresh-token',
    youtube_channel_id: 'chan1',
  };
  const videoRequest: PublishRequest = {
    contentId: 'c2',
    platform: 'youtube',
    mediaUrl: 'https://example.com/video.mp4',
    mediaType: 'video',
    title: 'Stage Performance',
    description: 'First time on stage',
  };

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('errors without a request when no refresh token is present', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const result = await youtubeClient.publish(videoRequest, {});

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not connected/i);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('refreshes a token, downloads media, and completes a resumable upload', async () => {
    const fetchSpy = vi
      .fn()
      // 1. token refresh
      .mockResolvedValueOnce({ ok: true, json: async () => ({ access_token: 'fresh' }) })
      // 2. download media
      .mockResolvedValueOnce({ ok: true, blob: async () => new Blob(['x'], { type: 'video/mp4' }) })
      // 3. initiate resumable upload -> returns Location header
      .mockResolvedValueOnce({
        ok: true,
        headers: { get: (h: string) => (h === 'Location' ? 'https://upload.googleapis.com/u1' : null) },
        json: async () => ({}),
      })
      // 4. PUT bytes -> final video
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'vid42' }) });
    vi.stubGlobal('fetch', fetchSpy);

    const result = await youtubeClient.publish(videoRequest, tokens);

    expect(result.success).toBe(true);
    expect(result.platformPostId).toBe('vid42');
    expect(result.platformUrl).toBe('https://youtube.com/watch?v=vid42');
    expect(fetchSpy).toHaveBeenCalledTimes(4);
    expect(fetchSpy.mock.calls[0][0]).toBe('https://oauth2.googleapis.com/token');
    expect(fetchSpy.mock.calls[3][0]).toBe('https://upload.googleapis.com/u1');
  });

  it('reports an error when the resumable upload returns no Location header', async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ access_token: 'fresh' }) })
      .mockResolvedValueOnce({ ok: true, blob: async () => new Blob(['x'], { type: 'video/mp4' }) })
      .mockResolvedValueOnce({ ok: true, headers: { get: () => null }, json: async () => ({}) });
    vi.stubGlobal('fetch', fetchSpy);

    const result = await youtubeClient.publish(videoRequest, tokens);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/did not return upload url/i);
  });
});
