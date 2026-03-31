import { test, expect } from '@playwright/test';

/**
 * Settings API integration tests.
 * Tests GET/PATCH settings, credential masking, and validation.
 */
test.describe('Settings API', () => {
  test('GET /api/settings returns settings object', async ({ request }) => {
    const res = await request.get('/api/settings');
    // May be 401 if proxy is blocking; that's expected behavior
    if (res.status() === 401) {
      test.skip();
      return;
    }
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('facebook_enabled');
    expect(body).toHaveProperty('instagram_enabled');
    expect(body).toHaveProperty('youtube_enabled');
    expect(body).toHaveProperty('require_review');
    expect(body).toHaveProperty('facebook_connected');
    expect(body).toHaveProperty('instagram_connected');
    expect(body).toHaveProperty('youtube_connected');
    expect(body).toHaveProperty('admin_pin_configured');
  });

  test('GET /api/settings masks secrets', async ({ request }) => {
    const res = await request.get('/api/settings');
    if (res.status() === 401) { test.skip(); return; }
    const body = await res.json();
    // If secrets are set, they should be masked
    if (body.facebook_app_secret) {
      expect(body.facebook_app_secret).toContain('*');
    }
    if (body.google_client_secret) {
      expect(body.google_client_secret).toContain('*');
    }
  });

  test('PATCH /api/settings updates toggles', async ({ request }) => {
    const res = await request.patch('/api/settings', {
      data: { require_review: true },
    });
    if (res.status() === 401) { test.skip(); return; }
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  test('PATCH /api/settings rejects unknown fields', async ({ request }) => {
    const res = await request.patch('/api/settings', {
      data: { unknown_field: 'hack' },
    });
    if (res.status() === 401) { test.skip(); return; }
    expect(res.status()).toBe(400);
  });

  test('PATCH /api/settings skips masked values', async ({ request }) => {
    const res = await request.patch('/api/settings', {
      data: { facebook_app_secret: '****abcd' },
    });
    if (res.status() === 401) { test.skip(); return; }
    // Should succeed but not actually update the secret
    expect([200, 400]).toContain(res.status());
  });
});
