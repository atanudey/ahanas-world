'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { TABS } from '@/lib/constants';

export function PublicNav() {
  const { theme: t } = useTheme();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className={`sticky top-0 z-50 bg-white/[0.03] backdrop-blur-2xl border-b ${t.border} px-6 py-4`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className={`w-10 h-10 bg-gradient-to-tr ${t.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform`}>
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <span className={`text-xl font-black tracking-tight italic ${t.text}`}>
            AHANA&apos;S WORLD
          </span>
        </Link>

        <div className="hidden lg:flex gap-1 bg-black/5 rounded-2xl p-1">
          {TABS.map((tab) => (
            <Link
              key={tab.id}
              href={tab.href}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive(tab.href)
                  ? `bg-white shadow-sm border ${t.border} ${t.text}`
                  : `${t.muted} hover:${t.text}`
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? <X className={t.text} /> : <Menu className={t.text} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden mt-4 pb-4 border-t border-white/10 pt-4">
          <div className="flex flex-col gap-2">
            {TABS.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                onClick={() => setIsMenuOpen(false)}
                className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive(tab.href)
                    ? `${t.accentBg} ${t.accent}`
                    : `${t.muted}`
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
