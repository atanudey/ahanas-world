import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createOAuthState, verifyOAuthState, OAUTH_STATE_TTL_SECONDS } from '@/lib/auth/oauth-state';

/**
 * The OAuth callback is public, so this state check is what stops anyone from
 * attaching their own Facebook/YouTube account to the site.
 */
describe('OAuth state', () => {
  beforeEach(() => {
    vi.stubEnv('ADMIN_SESSION_SECRET', 'test-signing-secret');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it('accepts a state that matches its cookie and returns the platform', async () => {
    const state = await createOAuthState('google');
    expect(await verifyOAuthState(state, state)).toBe('google');
  });

  it('rejects the legacy fixed state values', async () => {
    expect(await verifyOAuthState('facebook', 'facebook')).toBeNull();
    expect(await verifyOAuthState('google', undefined)).toBeNull();
  });

  it('rejects a valid state without the matching cookie (replayed in another browser)', async () => {
    const state = await createOAuthState('facebook');
    expect(await verifyOAuthState(state, undefined)).toBeNull();
    expect(await verifyOAuthState(state, await createOAuthState('facebook'))).toBeNull();
  });

  it('rejects a forged state even when the cookie is set to match', async () => {
    const forged = `facebook.${Math.floor(Date.now() / 1000) + 600}.abcd.${'0'.repeat(64)}`;
    expect(await verifyOAuthState(forged, forged)).toBeNull();
  });

  it('rejects a state with the platform swapped', async () => {
    const state = await createOAuthState('facebook');
    const swapped = state.replace(/^facebook/, 'google');
    expect(await verifyOAuthState(swapped, swapped)).toBeNull();
  });

  it('rejects a state signed with a different secret', async () => {
    const state = await createOAuthState('google');
    vi.stubEnv('ADMIN_SESSION_SECRET', 'rotated-secret');
    expect(await verifyOAuthState(state, state)).toBeNull();
  });

  it('rejects an expired state', async () => {
    vi.useFakeTimers();
    const state = await createOAuthState('google');
    vi.advanceTimersByTime((OAUTH_STATE_TTL_SECONDS + 1) * 1000);
    expect(await verifyOAuthState(state, state)).toBeNull();
  });
});
