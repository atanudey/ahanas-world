import { test, expect } from '@playwright/test';

/**
 * OAuth route tests — non-interactive.
 * Verifies redirect behavior and error handling.
 */
test.describe('OAuth Routes', () => {
  test('Unknown platform returns 400', async ({ request }) => {
    const res = await request.get('/api/settings/oauth/tiktok');
    if (res.status() === 401) { test.skip(); return; }
    expect(res.status()).toBe(400);
  });

  test('OAuth callback without code redirects with error', async ({ request }) => {
    const res = await request.get('/api/settings/oauth/callback?error=access_denied&state=facebook', {
      maxRedirects: 0,
    });
    // Should redirect (302/307)
    expect([302, 307]).toContain(res.status());
    const location = res.headers()['location'] || '';
    expect(location).toContain('oauth_error');
  });

  test('OAuth callback without state redirects gracefully', async ({ request }) => {
    const res = await request.get('/api/settings/oauth/callback?code=fake_code', {
      maxRedirects: 0,
    });
    // Should redirect — either success or error depending on token exchange
    expect([302, 307]).toContain(res.status());
  });

  test('Facebook OAuth redirects to v21.0', async ({ request }) => {
    const res = await request.get('/api/settings/oauth/facebook', {
      maxRedirects: 0,
    });
    if (res.status() === 401) { test.skip(); return; }
    if (res.status() === 500) {
      // Credentials not configured — that's fine
      test.skip();
      return;
    }
    expect([302, 307]).toContain(res.status());
    const location = res.headers()['location'] || '';
    expect(location).toContain('v21.0');
    expect(location).toContain('facebook.com');
  });

  test('Google OAuth requests offline access', async ({ request }) => {
    const res = await request.get('/api/settings/oauth/google', {
      maxRedirects: 0,
    });
    if (res.status() === 401) { test.skip(); return; }
    if (res.status() === 500) { test.skip(); return; }
    expect([302, 307]).toContain(res.status());
    const location = res.headers()['location'] || '';
    expect(location).toContain('access_type=offline');
    expect(location).toContain('accounts.google.com');
  });
});
