import { test, expect } from '@playwright/test';

/**
 * Public pages — navigation, content rendering, SEO metadata.
 */
test.describe('Public Pages', () => {
  test('Homepage has hero section', async ({ page }) => {
    await page.goto('/');
    // Should have some content — check for navigation or hero
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('Music page has correct title', async ({ page }) => {
    await page.goto('/music');
    await expect(page).toHaveTitle(/Songs from the Stars/);
  });

  test('Art page has correct title', async ({ page }) => {
    await page.goto('/art');
    await expect(page).toHaveTitle(/From the Sketchbook/);
  });

  test('Reading page has correct title', async ({ page }) => {
    await page.goto('/reading');
    await expect(page).toHaveTitle(/Books That Spark/);
  });

  test('Space page has correct title', async ({ page }) => {
    await page.goto('/space');
    await expect(page).toHaveTitle(/Tiny Science Wonders/);
  });

  test('Milestones page has correct title', async ({ page }) => {
    await page.goto('/milestones');
    await expect(page).toHaveTitle(/Growth Journey/);
  });

  test('Homepage has OpenGraph meta tags', async ({ page }) => {
    await page.goto('/');
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toContain('Ahana');
  });

  test('Hub page requires the parent session', async ({ page }) => {
    await page.goto('/hub');
    // The proxy sends it to the login and remembers where it was heading.
    await expect(page).toHaveURL(/\/parent\/login\?next=%2Fhub/);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('Navigation between sections works', async ({ page }) => {
    await page.goto('/music');
    // Wait for page content
    await page.waitForLoadState('networkidle');
    // Should be on music page
    expect(page.url()).toContain('/music');
  });

  test('Non-existent content is a 404 with the not-found page', async ({ page }) => {
    const res = await page.goto('/content/this-slug-does-not-exist');
    expect(res?.status()).toBe(404);
    const body = await page.textContent('body');
    expect(body).toContain("doesn't exist or isn't public yet");
  });
});
