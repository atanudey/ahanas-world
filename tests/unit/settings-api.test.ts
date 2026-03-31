import { describe, it, expect } from 'vitest';

/**
 * Tests for the settings API logic (mask function, field validation).
 * These test pure functions extracted from the API route logic.
 */

function maskSecret(value: string | null | undefined): string {
  if (!value) return '';
  if (value.length <= 4) return '****';
  return '*'.repeat(value.length - 4) + value.slice(-4);
}

const ALLOWED_FIELDS = [
  'auto_publish', 'facebook_enabled', 'instagram_enabled',
  'youtube_enabled', 'require_review',
  'facebook_app_id', 'facebook_app_secret',
  'google_client_id', 'google_client_secret',
  'google_redirect_uri', 'site_url',
];

function filterUpdates(body: Record<string, unknown>): Record<string, unknown> {
  const updates: Record<string, unknown> = {};
  for (const key of ALLOWED_FIELDS) {
    if (key in body) {
      const val = body[key];
      if (typeof val === 'string' && val.includes('***')) continue;
      updates[key] = val;
    }
  }
  return updates;
}

describe('maskSecret', () => {
  it('returns empty string for null/undefined', () => {
    expect(maskSecret(null)).toBe('');
    expect(maskSecret(undefined)).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(maskSecret('')).toBe('');
  });

  it('masks short values completely', () => {
    expect(maskSecret('ab')).toBe('****');
    expect(maskSecret('abcd')).toBe('****');
  });

  it('shows last 4 chars of longer values', () => {
    expect(maskSecret('mysecretvalue123')).toBe('************e123');
    expect(maskSecret('12345')).toBe('*2345');
  });

  it('masks a typical Facebook App Secret', () => {
    const secret = '63b146e0268a167df71695bed58c0c8c';
    const masked = maskSecret(secret);
    expect(masked).toContain('0c8c');
    expect(masked).not.toContain('63b1');
    expect(masked.length).toBe(secret.length);
  });
});

describe('filterUpdates', () => {
  it('allows valid settings fields', () => {
    const result = filterUpdates({
      facebook_enabled: true,
      require_review: false,
      site_url: 'https://example.com',
    });
    expect(result).toEqual({
      facebook_enabled: true,
      require_review: false,
      site_url: 'https://example.com',
    });
  });

  it('rejects unknown fields', () => {
    const result = filterUpdates({
      hack_field: 'malicious',
      facebook_enabled: true,
    });
    expect(result).toEqual({ facebook_enabled: true });
    expect(result).not.toHaveProperty('hack_field');
  });

  it('skips masked secret values', () => {
    const result = filterUpdates({
      facebook_app_id: '123456',
      facebook_app_secret: '****************************0c8c',
    });
    expect(result).toEqual({ facebook_app_id: '123456' });
    expect(result).not.toHaveProperty('facebook_app_secret');
  });

  it('allows real secret values (no asterisks)', () => {
    const result = filterUpdates({
      facebook_app_secret: 'real_secret_value',
      google_client_secret: 'another_secret',
    });
    expect(result).toEqual({
      facebook_app_secret: 'real_secret_value',
      google_client_secret: 'another_secret',
    });
  });

  it('returns empty object for no valid fields', () => {
    const result = filterUpdates({
      invalid: 'field',
      another_invalid: 'field',
    });
    expect(result).toEqual({});
  });

  it('handles empty body', () => {
    expect(filterUpdates({})).toEqual({});
  });
});
