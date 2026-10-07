'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { LogOut, Pickaxe } from 'lucide-react';

/**
 * Pixel-art frame for the parent dashboard. The section views are shared with
 * the other themes (they take their colours from the theme tokens), so every
 * section works here too; this only supplies the chrome and navigation.
 */
export function MinecraftParent({
  sections,
  activeSection,
  onSectionChange,
  children,
}: {
  sections: readonly string[];
  activeSection: string;
  onSectionChange: (section: string) => void;
  children: ReactNode;
}) {
  const linkClass = (section: string) =>
    section === activeSection
      ? 'mc-grass-block text-white'
      : 'text-gray-300 hover:text-white hover:bg-white/10 border-2 border-transparent';

  return (
    <div className="mc-bg mc-font min-h-screen text-white relative">
      <div className="mc-overlay" />

      <div className="min-h-screen bg-black/60 backdrop-blur-md flex relative z-10">
        {/* Sidebar */}
        <aside className="w-48 lg:w-56 mc-glass p-4 flex-col hidden lg:flex border-l-0 border-t-0 border-b-0 border-r-4 border-r-white/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 mc-wood-block flex items-center justify-center text-white">
              <Pickaxe className="w-6 h-6 drop-shadow-md" />
            </div>
            <p className="text-sm font-mc text-[#FF5555] mc-text-shadow">
              Admin HQ
            </p>
          </div>
          <nav className="space-y-2">
            {sections.map((section) => (
              <button
                key={section}
                onClick={() => onSectionChange(section)}
                aria-current={section === activeSection ? 'page' : undefined}
                className={`w-full text-left px-3 py-2 text-xs mc-text-shadow-sm transition-all ${linkClass(section)}`}
              >
                {section}
              </button>
            ))}
          </nav>
          <Link href="/" className="mt-auto pt-6 flex items-center gap-2 text-xs text-gray-300 mc-text-shadow-sm hover:text-white">
            <LogOut className="w-4 h-4" /> Leave HQ
          </Link>
        </aside>

        {/* Main */}
        <main className="flex-1 p-4 lg:p-6 pb-24 overflow-y-auto min-w-0">
          {/* Section links for small screens */}
          <nav className="lg:hidden flex gap-2 overflow-x-auto pb-3 mb-4" aria-label="Sections">
            {sections.map((section) => (
              <button
                key={section}
                onClick={() => onSectionChange(section)}
                aria-current={section === activeSection ? 'page' : undefined}
                className={`shrink-0 px-3 py-2 text-xs mc-text-shadow-sm ${linkClass(section)}`}
              >
                {section}
              </button>
            ))}
            <Link href="/" className="shrink-0 px-3 py-2 text-xs text-gray-300 mc-text-shadow-sm border-2 border-transparent hover:text-white">
              Leave
            </Link>
          </nav>

          {children}
        </main>
      </div>
    </div>
  );
}
