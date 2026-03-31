import { describe, it, expect } from 'vitest';

async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

describe('PIN hashing', () => {
  it('produces a 64-char hex string', async () => {
    const hash = await hashPin('1234');
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('same PIN produces same hash', async () => {
    const h1 = await hashPin('5678');
    const h2 = await hashPin('5678');
    expect(h1).toBe(h2);
  });

  it('different PINs produce different hashes', async () => {
    const h1 = await hashPin('1234');
    const h2 = await hashPin('4321');
    expect(h1).not.toBe(h2);
  });

  it('known SHA-256 of "1234"', async () => {
    const hash = await hashPin('1234');
    // SHA-256("1234") is well-known
    expect(hash).toBe('03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4');
  });
});
