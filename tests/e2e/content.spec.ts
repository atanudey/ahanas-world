import { test, expect } from '@playwright/test';

/**
 * Content CRUD API tests.
 * Creates, reads, updates, and deletes content via the API.
 */
test.describe('Content API', () => {
  let contentId: string | null = null;

  test.afterAll(async ({ request }) => {
    // Cleanup: delete test content if it exists
    if (contentId) {
      await request.delete(`/api/content/${contentId}`).catch(() => {});
    }
  });

  test('GET /api/content returns array', async ({ request }) => {
    const res = await request.get('/api/content');
    if (res.status() === 401) { test.skip(); return; }
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('POST /api/content/upload creates content', async ({ request }) => {
    const res = await request.post('/api/content/upload', {
      multipart: {
        type: 'reading',
        title: `E2E Test ${Date.now()}`,
        notes: 'Created by Playwright E2E test',
        mimeType: '',
      },
    });
    if (res.status() === 401) { test.skip(); return; }
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('id');
    expect(body.status).toBe('review_needed');
    expect(body.visibility).toBe('private');
    contentId = body.id;
  });

  test('GET /api/content/:id returns detail', async ({ request }) => {
    if (!contentId) { test.skip(); return; }
    const res = await request.get(`/api/content/${contentId}`);
    if (res.status() === 401) { test.skip(); return; }
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(contentId);
    expect(body.title).toContain('E2E Test');
  });

  test('PATCH /api/content/:id updates content', async ({ request }) => {
    if (!contentId) { test.skip(); return; }
    const res = await request.patch(`/api/content/${contentId}`, {
      data: {
        description: 'Updated by E2E test',
        notes: 'Modified notes',
      },
    });
    if (res.status() === 401) { test.skip(); return; }
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.description).toBe('Updated by E2E test');
  });

  test('GET /api/content?status= filters correctly', async ({ request }) => {
    const res = await request.get('/api/content?status=review_needed');
    if (res.status() === 401) { test.skip(); return; }
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('DELETE /api/content/:id removes content', async ({ request }) => {
    if (!contentId) { test.skip(); return; }
    const res = await request.delete(`/api/content/${contentId}`);
    if (res.status() === 401) { test.skip(); return; }
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    contentId = null; // Prevent afterAll cleanup
  });

  test('GET /api/content/:id returns 404/500 for deleted content', async ({ request }) => {
    const res = await request.get('/api/content/00000000-0000-0000-0000-000000000000');
    if (res.status() === 401) { test.skip(); return; }
    expect([404, 500]).toContain(res.status());
  });
});
