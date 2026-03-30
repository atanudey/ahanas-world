'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { THEMES, THEME_ORDER, type ThemeMode, type Theme } from '@/lib/theme';

interface ThemeContextValue {
  mode: ThemeMode;
  theme: Theme;
  setTheme: (mode: ThemeMode) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('moonlit');

  // Set data-theme attribute on <html> for Minecraft CSS hooks
  useEffect(() => {
    const html = document.documentElement;
    if (mode === 'minecraft') {
      html.setAttribute('data-theme', 'minecraft');
    } else {
      html.removeAttribute('data-theme');
    }
  }, [mode]);

  const toggle = useCallback(() => {
    setMode((prev) => {
      const idx = THEME_ORDER.indexOf(prev);
      return THEME_ORDER[(idx + 1) % THEME_ORDER.length];
    });
  }, []);

  const setTheme = useCallback((m: ThemeMode) => {
    setMode(m);
  }, []);

  const value: ThemeContextValue = {
    mode,
    theme: THEMES[mode],
    setTheme,
    toggle,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
