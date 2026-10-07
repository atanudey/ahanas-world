/**
 * OAuth `state` handling — binds the provider callback to a flow that an
 * authenticated parent started in this browser.
 *
 * The state is `platform.expiry.nonce.signature`, HMAC-signed with the session
 * secret so it can't be forged, and mirrored in a short-lived httpOnly cookie so
 * a valid state minted for one browser can't be replayed in another.
 *
 * The admin session cookie is SameSite=Strict, so it is NOT sent on the
 * cross-site redirect back from Facebook/Google; the callback relies on this
 * state instead. Only the (proxy-protected) initiation route can mint one.
 */

import { signPayload, timingSafeEqual } from './session';

export const OAUTH_STATE_COOKIE = 'ahanas_oauth_state';
export const OAUTH_STATE_TTL_SECONDS = 10 * 60;

export type OAuthPlatform = 'facebook' | 'google';

function randomNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function createOAuthState(platform: OAuthPlatform): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + OAUTH_STATE_TTL_SECONDS;
  const payload = `${platform}.${exp}.${randomNonce()}`;
  return `${payload}.${await signPayload(payload)}`;
}

/**
 * Validate the state returned by the provider against the cookie set when the
 * flow started. Returns the platform on success, null otherwise.
 */
export async function verifyOAuthState(
  state: string | null,
  cookieValue: string | undefined,
): Promise<OAuthPlatform | null> {
  if (!state || !cookieValue || !timingSafeEqual(state, cookieValue)) return null;

  const parts = state.split('.');
  if (parts.length !== 4) return null;
  const [platform, expStr, nonce, signature] = parts;
  if (platform !== 'facebook' && platform !== 'google') return null;

  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp * 1000 <= Date.now()) return null;

  let expected: string;
  try {
    expected = await signPayload(`${platform}.${expStr}.${nonce}`);
  } catch {
    return null;
  }
  return timingSafeEqual(signature, expected) ? platform : null;
}
