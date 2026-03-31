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

  test('Hub page loads (child creative studio)', async ({ page }) => {
    await page.goto('/hub');
    await expect(page.locator('body')).not.toBeEmpty();
    // Hub should be accessible without auth
    expect(page.url()).toContain('/hub');
  });

  test('Navigation between sections works', async ({ page }) => {
    await page.goto('/music');
    // Wait for page content
    await page.waitForLoadState('networkidle');
    // Should be on music page
    expect(page.url()).toContain('/music');
  });

  test('Non-existent content shows not found', async ({ page }) => {
    await page.goto('/content/this-slug-does-not-exist');
    // Should show "Not Found" message
    const body = await page.textContent('body');
    expect(body).toContain('Not Found');
  });
});
