'use client';

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { THEMES, THEME_ORDER, type ThemeMode, type Theme } from '@/lib/theme';

interface ThemeContextValue {
  mode: ThemeMode;
  theme: Theme;
  setTheme: (mode: ThemeMode) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'ahanas-theme';
const DEFAULT_MODE: ThemeMode = 'moonlit';

function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return DEFAULT_MODE;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && THEME_ORDER.includes(stored as ThemeMode)) {
    return stored as ThemeMode;
  }
  return DEFAULT_MODE;
}

// Same-tab subscribers are notified manually because the `storage` event only
// fires in *other* tabs. This lets the theme act as an external store, which
// keeps reads hydration-safe (no setState-in-effect / cascading renders).
const listeners = new Set<() => void>();

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  window.addEventListener('storage', onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener('storage', onChange);
  };
}

function persistTheme(mode: ThemeMode) {
  localStorage.setItem(STORAGE_KEY, mode);
  listeners.forEach((l) => l());
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const mode = useSyncExternalStore(subscribe, getStoredTheme, () => DEFAULT_MODE);

  // Reflect the active theme onto <html> for Minecraft CSS hooks.
  useEffect(() => {
    const html = document.documentElement;
    if (mode === 'minecraft') {
      html.setAttribute('data-theme', 'minecraft');
    } else {
      html.removeAttribute('data-theme');
    }
  }, [mode]);

  const toggle = useCallback(() => {
    const idx = THEME_ORDER.indexOf(getStoredTheme());
    persistTheme(THEME_ORDER[(idx + 1) % THEME_ORDER.length]);
  }, []);

  const setTheme = useCallback((m: ThemeMode) => {
    persistTheme(m);
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
