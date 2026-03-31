import { test, expect } from '@playwright/test';

/**
 * Quick smoke test: every app root URL returns 200.
 * Run this first to verify the app is up.
 */
test.describe('Smoke Tests', () => {
  const pages = [
    ['/', 'Homepage'],
    ['/hub', 'Child Hub'],
    ['/music', 'Music section'],
    ['/art', 'Art section'],
    ['/reading', 'Reading section'],
    ['/space', 'Space section'],
    ['/milestones', 'Milestones section'],
    ['/parent/login', 'Parent login'],
  ];

  for (const [path, name] of pages) {
    test(`${name} (${path}) loads`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
    });
  }

  test('PWA manifest is served', async ({ request }) => {
    const res = await request.get('/manifest.webmanifest');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.name).toContain('Ahana');
  });

  test('App icon is generated', async ({ request }) => {
    const res = await request.get('/icon');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('image/png');
  });

  test('Favicon exists', async ({ request }) => {
    const res = await request.get('/favicon.ico');
    expect(res.status()).toBe(200);
  });
});
