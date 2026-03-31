import { describe, it, expect } from 'vitest';
import { THEMES, THEME_ORDER } from '@/lib/theme';

describe('Theme system', () => {
  it('has 3 themes', () => {
    expect(Object.keys(THEMES)).toHaveLength(3);
  });

  it('includes moonlit, storybook, and minecraft', () => {
    expect(THEMES).toHaveProperty('moonlit');
    expect(THEMES).toHaveProperty('storybook');
    expect(THEMES).toHaveProperty('minecraft');
  });

  it('THEME_ORDER has all 3 modes', () => {
    expect(THEME_ORDER).toHaveLength(3);
    expect(THEME_ORDER).toContain('moonlit');
    expect(THEME_ORDER).toContain('storybook');
    expect(THEME_ORDER).toContain('minecraft');
  });

  it('each theme has required properties', () => {
    const requiredKeys = ['name', 'id', 'bg', 'surface', 'card', 'border', 'text', 'muted', 'accent', 'gradient', 'shadow', 'glass'];
    for (const [mode, theme] of Object.entries(THEMES)) {
      for (const key of requiredKeys) {
        expect(theme, `${mode}.${key} should exist`).toHaveProperty(key);
      }
    }
  });

  it('moonlit is dark theme', () => {
    expect(THEMES.moonlit.id).toBe('dark');
  });

  it('storybook is light theme', () => {
    expect(THEMES.storybook.id).toBe('light');
  });

  it('minecraft is minecraft theme', () => {
    expect(THEMES.minecraft.id).toBe('minecraft');
  });
});
