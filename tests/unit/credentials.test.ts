import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Tests for getAppCredentials — the single source of truth for server-side
 * credential reads. Verifies the DB-first behaviour, the per-field env-var
 * fallback, and the graceful fallback when the database is unreachable.
 */

// Hoisted mock handle so we can swap the Supabase response per test.
const { singleMock } = vi.hoisted(() => ({ singleMock: vi.fn() }));

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseAdmin: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          single: singleMock,
        }),
      }),
    }),
  }),
}));

const ENV_KEYS = [
  'FACEBOOK_APP_ID',
  'FACEBOOK_APP_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REDIRECT_URI',
  'NEXT_PUBLIC_SITE_URL',
] as const;

describe('getAppCredentials', () => {
  beforeEach(() => {
    singleMock.mockReset();
    for (const k of ENV_KEYS) vi.stubEnv(k, '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('prefers values stored in parent_settings over env vars', async () => {
    vi.stubEnv('FACEBOOK_APP_ID', 'env-fb-id');
    singleMock.mockResolvedValue({
      data: {
        facebook_app_id: 'db-fb-id',
        facebook_app_secret: 'db-fb-secret',
        google_client_id: 'db-google-id',
        google_client_secret: 'db-google-secret',
        google_redirect_uri: 'https://db.example.com/callback',
        site_url: 'https://db.example.com',
      },
      error: null,
    });

    const { getAppCredentials } = await import('@/lib/credentials');
    const creds = await getAppCredentials();

    expect(creds.facebookAppId).toBe('db-fb-id');
    expect(creds.facebookAppSecret).toBe('db-fb-secret');
    expect(creds.googleRedirectUri).toBe('https://db.example.com/callback');
    expect(creds.siteUrl).toBe('https://db.example.com');
  });

  it('falls back to env vars per-field when the DB value is empty', async () => {
    vi.stubEnv('FACEBOOK_APP_ID', 'env-fb-id');
    vi.stubEnv('GOOGLE_CLIENT_ID', 'env-google-id');
    singleMock.mockResolvedValue({
      data: { facebook_app_secret: 'db-fb-secret' },
      error: null,
    });

    const { getAppCredentials } = await import('@/lib/credentials');
    const creds = await getAppCredentials();

    expect(creds.facebookAppId).toBe('env-fb-id'); // from env
    expect(creds.facebookAppSecret).toBe('db-fb-secret'); // from db
    expect(creds.googleClientId).toBe('env-google-id'); // from env
  });

  it('defaults siteUrl to localhost when neither DB nor env provide it', async () => {
    singleMock.mockResolvedValue({ data: null, error: null });

    const { getAppCredentials } = await import('@/lib/credentials');
    const creds = await getAppCredentials();

    expect(creds.siteUrl).toBe('http://localhost:3000');
    expect(creds.facebookAppId).toBe('');
  });

  it('falls back to env vars when the database query throws', async () => {
    vi.stubEnv('FACEBOOK_APP_ID', 'env-fb-id');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://env.example.com');
    singleMock.mockRejectedValue(new Error('connection refused'));

    const { getAppCredentials } = await import('@/lib/credentials');
    const creds = await getAppCredentials();

    expect(creds.facebookAppId).toBe('env-fb-id');
    expect(creds.siteUrl).toBe('https://env.example.com');
  });
});
