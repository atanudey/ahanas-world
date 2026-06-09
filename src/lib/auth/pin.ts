/**
 * Admin PIN hashing. Centralised so the verify-pin route and the settings route
 * hash identically (previously each re-implemented the same SHA-256 logic).
 *
 * NOTE: a 4–8 digit PIN has very low entropy, so the hash mainly guards against
 * casual disclosure of the stored value, not brute force. Brute force is
 * mitigated at the auth layer (see ARCHITECTURE-REVIEW.md → rate limiting).
 */

import { timingSafeEqual } from './session';

export async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Compare a raw PIN against a stored hash in constant time. */
export async function verifyPin(pin: string, storedHash: string): Promise<boolean> {
  const candidate = await hashPin(pin);
  return timingSafeEqual(candidate, storedHash);
}
