'use client';

import { useTheme } from '@/context/ThemeContext';

export function HeroSection() {
  const { theme: t } = useTheme();

  return (
    <header className="max-w-7xl mx-auto px-6 pt-24 pb-16 text-center relative">
      <div
        className={`absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 ${t.accentBg} blur-[120px] -z-10 rounded-full`}
      />
      <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[1] tracking-tighter">
        Songs, Sketches, <br />
        <span className={`text-transparent bg-clip-text bg-gradient-to-r ${t.gradient}`}>
          Stories &amp; Stars.
        </span>
      </h1>
      <p className={`${t.muted} text-xl max-w-2xl mx-auto mb-12 font-medium leading-relaxed`}>
        A 9-year-old&apos;s journey through the creative universe. Safe,
        parent-managed, and fueled by imagination.
      </p>
      <div className="flex flex-wrap justify-center gap-6">
        <button
          className={`px-10 py-4 bg-gradient-to-r ${t.gradient} text-white rounded-2xl font-bold text-lg shadow-xl hover:scale-[1.02] transition active:scale-95`}
        >
          Watch Latest Piece
        </button>
      </div>
    </header>
  );
}
