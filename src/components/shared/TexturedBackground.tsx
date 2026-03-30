'use client';

import { useTheme } from '@/context/ThemeContext';

export function TexturedBackground() {
  const { theme: t } = useTheme();

  return (
    <div
      className={`absolute inset-0 pointer-events-none ${t.texture}`}
      style={{
        backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')",
      }}
    />
  );
}
