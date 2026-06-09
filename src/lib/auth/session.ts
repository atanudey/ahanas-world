/**
 * Admin session tokens — HMAC-signed and self-expiring.
 *
 * The previous implementation generated a random token that was never stored or
 * verified; the proxy only checked that *some* cookie value was present, so any
 * non-empty cookie passed authentication. These tokens are instead signed with a
 * server secret and carry an expiry, so the proxy can verify them statelessly
 * (no database round-trip) and reject tampered or expired sessions.
 *
 * The signing secret comes from `ADMIN_SESSION_SECRET`, falling back to
 * `SUPABASE_SERVICE_ROLE_KEY` (always present server-side) so the app keeps
 * working without additional configuration. Set a dedicated `ADMIN_SESSION_SECRET`
 * in production if you want to rotate sessions independently of the DB key.
 */

export const SESSION_COOKIE = 'ahanas_admin_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 24; // 24 hours
const TOKEN_VERSION = 'v1';

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    throw new Error(
      'No session signing secret configured. Set ADMIN_SESSION_SECRET (or SUPABASE_SERVICE_ROLE_KEY).',
    );
  }
  return secret;
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hmacHex(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return toHex(signature);
}

/** Constant-time string comparison to avoid leaking match progress via timing. */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/** Create a signed `version.expiry.signature` session token. */
export async function createSessionToken(ttlSeconds: number = SESSION_TTL_SECONDS): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `${TOKEN_VERSION}.${exp}`;
  const signature = await hmacHex(payload, getSecret());
  return `${payload}.${signature}`;
}

/** Verify a session token's signature and expiry. Returns false for anything invalid. */
export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [version, expStr, signature] = parts;
  if (version !== TOKEN_VERSION) return false;

  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp * 1000 <= Date.now()) return false;

  let expected: string;
  try {
    expected = await hmacHex(`${version}.${expStr}`, getSecret());
  } catch {
    return false;
  }
  return timingSafeEqual(signature, expected);
}
