import { describe, it, expect } from 'vitest';
import { MOCK_CONTENT, TABS } from '@/lib/constants';

describe('Constants', () => {
  describe('MOCK_CONTENT', () => {
    it('has items', () => {
      expect(MOCK_CONTENT.length).toBeGreaterThan(0);
    });

    it('each item has required fields', () => {
      for (const item of MOCK_CONTENT) {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('title');
        expect(item).toHaveProperty('slug');
        expect(item).toHaveProperty('status');
        expect(item).toHaveProperty('visibility');
        expect(item).toHaveProperty('category');
        expect(item).toHaveProperty('medium');
      }
    });

    it('slugs are URL-safe', () => {
      for (const item of MOCK_CONTENT) {
        expect(item.slug).toMatch(/^[a-z0-9-]+$/);
      }
    });

    it('published items have public visibility', () => {
      const published = MOCK_CONTENT.filter(i => i.status === 'published');
      for (const item of published) {
        expect(item.visibility).toBe('public');
      }
    });
  });

  describe('TABS', () => {
    it('has navigation tabs', () => {
      expect(TABS.length).toBeGreaterThan(0);
    });
  });
});
