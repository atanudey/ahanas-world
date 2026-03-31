#!/usr/bin/env npx tsx
/**
 * Standalone broken link checker.
 * Crawls from a base URL, follows all internal links, checks images/CSS/JS.
 *
 * Usage:
 *   npx tsx tests/check-links.ts [URL]
 *   npx tsx tests/check-links.ts https://ahanas-world.repl.co
 */

const BASE = process.argv[2] || 'http://localhost:3000';
const visited = new Set<string>();
const broken: { url: string; status: number; foundOn: string; type: string }[] = [];
const queue: { url: string; foundOn: string }[] = [];

const SEED_PATHS = ['/', '/hub', '/music', '/art', '/reading', '/space', '/milestones', '/parent/login'];

async function checkUrl(url: string, foundOn: string, type: string): Promise<number> {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    return res.status;
  } catch {
    return 0;
  }
}

function isInternal(href: string): boolean {
  if (!href) return false;
  if (href.startsWith('/')) return true;
  try {
    const u = new URL(href);
    const b = new URL(BASE);
    return u.hostname === b.hostname;
  } catch {
    return false;
  }
}

function normalize(href: string): string {
  if (href.startsWith('/')) return `${BASE}${href}`;
  return href;
}

async function crawlPage(pageUrl: string): Promise<void> {
  const fullUrl = normalize(pageUrl);
  if (visited.has(fullUrl)) return;
  visited.add(fullUrl);

  let html: string;
  try {
    const res = await fetch(fullUrl);
    if (res.status >= 400) {
      broken.push({ url: fullUrl, status: res.status, foundOn: 'seed', type: 'page' });
      return;
    }
    html = await res.text();
  } catch {
    broken.push({ url: fullUrl, status: 0, foundOn: 'seed', type: 'page' });
    return;
  }

  // Extract links
  const linkRegex = /href="([^"]+)"/g;
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
    if (href.startsWith('/api/')) continue; // Skip API routes

    if (isInternal(href)) {
      const normalized = normalize(href);
      if (!visited.has(normalized)) {
        queue.push({ url: href, foundOn: pageUrl });
      }
    }
  }

  // Extract images
  const imgRegex = /src="([^"]+)"/g;
  while ((match = imgRegex.exec(html)) !== null) {
    const src = match[1];
    if (!src || src.startsWith('data:') || src.startsWith('blob:')) continue;
    if (isInternal(src)) {
      const full = normalize(src);
      if (!visited.has(full)) {
        visited.add(full);
        const status = await checkUrl(full, pageUrl, 'asset');
        if (status >= 400 || status === 0) {
          broken.push({ url: src, status, foundOn: pageUrl, type: 'asset' });
        }
      }
    }
  }
}

async function main() {
  console.log(`\n  Broken Link Checker — ${BASE}\n`);
  console.log(`  Crawling...`);

  // Seed pages
  for (const path of SEED_PATHS) {
    queue.push({ url: path, foundOn: 'seed' });
  }

  while (queue.length > 0) {
    const { url, foundOn } = queue.shift()!;
    const full = normalize(url);
    if (visited.has(full)) continue;
    process.stdout.write(`  Checking ${url}...`);
    await crawlPage(url);
    console.log(' done');
  }

  console.log(`\n  Checked ${visited.size} URLs\n`);

  if (broken.length === 0) {
    console.log('  \x1b[32mNo broken links found!\x1b[0m\n');
    process.exit(0);
  } else {
    console.log(`  \x1b[31m${broken.length} broken link(s) found:\x1b[0m\n`);
    for (const b of broken) {
      console.log(`    ${b.type.padEnd(6)} ${b.url}`);
      console.log(`           Status: ${b.status}, Found on: ${b.foundOn}`);
    }
    console.log('');
    process.exit(1);
  }
}

main();
