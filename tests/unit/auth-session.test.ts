import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createSessionToken,
  verifySessionToken,
  timingSafeEqual,
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
} from '@/lib/auth/session';
import { hashPin, verifyPin } from '@/lib/auth/pin';

describe('admin session tokens', () => {
  beforeEach(() => {
    vi.stubEnv('ADMIN_SESSION_SECRET', 'test-signing-secret');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('exposes the expected cookie name and TTL', () => {
    expect(SESSION_COOKIE).toBe('ahanas_admin_session');
    expect(SESSION_TTL_SECONDS).toBe(60 * 60 * 24);
  });

  it('round-trips a freshly created token', async () => {
    const token = await createSessionToken();
    expect(token.split('.')).toHaveLength(3);
    expect(await verifySessionToken(token)).toBe(true);
  });

  it('rejects an empty or malformed token', async () => {
    expect(await verifySessionToken(undefined)).toBe(false);
    expect(await verifySessionToken('')).toBe(false);
    expect(await verifySessionToken('not-a-token')).toBe(false);
    expect(await verifySessionToken('v1.123')).toBe(false);
  });

  it('rejects a token with a tampered signature', async () => {
    const token = await createSessionToken();
    const [v, exp] = token.split('.');
    const forged = `${v}.${exp}.${'0'.repeat(64)}`;
    expect(await verifySessionToken(forged)).toBe(false);
  });

  it('rejects a token whose expiry was extended (signature no longer matches)', async () => {
    const token = await createSessionToken();
    const [v, , sig] = token.split('.');
    const future = Math.floor(Date.now() / 1000) + 999999;
    expect(await verifySessionToken(`${v}.${future}.${sig}`)).toBe(false);
  });

  it('rejects an expired token', async () => {
    const expired = await createSessionToken(-10); // already in the past
    expect(await verifySessionToken(expired)).toBe(false);
  });

  it('rejects an unknown token version', async () => {
    const token = await createSessionToken();
    const [, exp, sig] = token.split('.');
    expect(await verifySessionToken(`v2.${exp}.${sig}`)).toBe(false);
  });

  it('does not validate a token signed with a different secret', async () => {
    const token = await createSessionToken();
    vi.stubEnv('ADMIN_SESSION_SECRET', 'a-completely-different-secret');
    expect(await verifySessionToken(token)).toBe(false);
  });

  it('falls back to the service role key when no dedicated secret is set', async () => {
    vi.stubEnv('ADMIN_SESSION_SECRET', '');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-role-key');
    const token = await createSessionToken();
    expect(await verifySessionToken(token)).toBe(true);
  });
});

describe('timingSafeEqual', () => {
  it('returns true only for identical strings', () => {
    expect(timingSafeEqual('abc', 'abc')).toBe(true);
    expect(timingSafeEqual('abc', 'abd')).toBe(false);
    expect(timingSafeEqual('abc', 'abcd')).toBe(false);
    expect(timingSafeEqual('', '')).toBe(true);
  });
});

describe('PIN hashing', () => {
  it('hashes deterministically (SHA-256 of "1234")', async () => {
    expect(await hashPin('1234')).toBe(
      '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',
    );
  });

  it('verifyPin accepts the correct PIN and rejects others', async () => {
    const stored = await hashPin('246810');
    expect(await verifyPin('246810', stored)).toBe(true);
    expect(await verifyPin('000000', stored)).toBe(false);
    expect(await verifyPin('24681', stored)).toBe(false);
  });
});
