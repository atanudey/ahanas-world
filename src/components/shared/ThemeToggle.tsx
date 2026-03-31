'use client';

import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Pickaxe } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { THEME_ORDER, THEMES, type ThemeMode } from '@/lib/theme';

const THEME_ICONS: Record<ThemeMode, { icon: typeof Sun; color: string }> = {
  moonlit: { icon: Moon, color: 'text-indigo-400' },
  storybook: { icon: Sun, color: 'text-yellow-500' },
  minecraft: { icon: Pickaxe, color: 'text-[#55FF55]' },
};

export function ThemeToggle() {
  const { mode, theme: t, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click/touch
  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, []);

  const CurrentIcon = THEME_ICONS[mode].icon;

  return (
    <div className="relative z-[60]" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`p-2 rounded-full border ${t.border} bg-white/20 hover:scale-110 transition active:scale-95 cursor-pointer`}
        style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
        aria-label="Switch theme"
      >
        <CurrentIcon className={`w-5 h-5 ${THEME_ICONS[mode].color}`} />
      </button>

      {open && (
        <div
          className={`absolute right-0 top-full mt-2 ${t.card} border ${t.border} shadow-xl backdrop-blur-xl overflow-hidden z-50`}
          style={{ minWidth: '180px', borderRadius: mode === 'minecraft' ? '0' : '1rem' }}
        >
          {THEME_ORDER.map((themeKey) => {
            const Icon = THEME_ICONS[themeKey].icon;
            const isActive = mode === themeKey;
            return (
              <button
                key={themeKey}
                onClick={() => {
                  setTheme(themeKey);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all cursor-pointer ${
                  isActive
                    ? `bg-gradient-to-r ${t.gradient} text-white`
                    : `${t.text} hover:bg-black/10`
                }`}
                style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : THEME_ICONS[themeKey].color}`} />
                {THEMES[themeKey].name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
