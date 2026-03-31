import { test, expect } from '@playwright/test';

/**
 * Broken link checker — crawls every page and verifies all internal links.
 * Also checks images and asset references.
 */
test.describe('Broken Link Checker', () => {
  const visited = new Set<string>();
  const broken: { url: string; status: number; foundOn: string }[] = [];
  const pagesToCrawl = [
    '/',
    '/hub',
    '/music',
    '/art',
    '/reading',
    '/space',
    '/milestones',
    '/parent/login',
  ];

  test('No broken internal links across all pages', async ({ page, request }) => {
    for (const startUrl of pagesToCrawl) {
      await page.goto(startUrl, { waitUntil: 'domcontentloaded' });

      // Collect all links on the page
      const links = await page.locator('a[href]').evaluateAll((anchors) =>
        anchors
          .map((a) => a.getAttribute('href'))
          .filter((href): href is string => !!href)
      );

      for (const href of links) {
        // Skip external links, anchors, javascript, mailto
        if (
          href.startsWith('http') ||
          href.startsWith('#') ||
          href.startsWith('javascript:') ||
          href.startsWith('mailto:') ||
          href.startsWith('tel:')
        ) {
          continue;
        }

        // Skip API routes (tested separately) and OAuth redirects
        if (href.startsWith('/api/')) continue;

        const fullUrl = href.startsWith('/') ? href : `/${href}`;
        if (visited.has(fullUrl)) continue;
        visited.add(fullUrl);

        try {
          const res = await request.get(fullUrl);
          if (res.status() >= 400) {
            broken.push({ url: fullUrl, status: res.status(), foundOn: startUrl });
          }
        } catch {
          broken.push({ url: fullUrl, status: 0, foundOn: startUrl });
        }
      }
    }

    if (broken.length > 0) {
      const report = broken
        .map((b) => `  ${b.url} → ${b.status} (found on ${b.foundOn})`)
        .join('\n');
      expect(broken, `Broken links found:\n${report}`).toHaveLength(0);
    }
  });

  test('No broken images on public pages', async ({ page, request }) => {
    const brokenImages: { src: string; foundOn: string }[] = [];

    for (const pageUrl of pagesToCrawl) {
      await page.goto(pageUrl, { waitUntil: 'domcontentloaded' });

      const imgSrcs = await page.locator('img[src]').evaluateAll((imgs) =>
        imgs
          .map((img) => img.getAttribute('src'))
          .filter((src): src is string => !!src)
      );

      for (const src of imgSrcs) {
        // Skip external images and data URIs
        if (src.startsWith('http') || src.startsWith('data:') || src.startsWith('blob:')) continue;

        try {
          const res = await request.get(src);
          if (res.status() >= 400) {
            brokenImages.push({ src, foundOn: pageUrl });
          }
        } catch {
          brokenImages.push({ src, foundOn: pageUrl });
        }
      }
    }

    if (brokenImages.length > 0) {
      const report = brokenImages
        .map((b) => `  ${b.src} (found on ${b.foundOn})`)
        .join('\n');
      expect(brokenImages, `Broken images found:\n${report}`).toHaveLength(0);
    }
  });
});
