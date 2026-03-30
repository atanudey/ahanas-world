'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';

const VIEWS = [
  { id: 'public', label: 'Public', href: '/' },
  { id: 'child', label: 'Child', href: '/hub' },
  { id: 'parent', label: 'Parent', href: '/parent' },
] as const;

export function ViewSwitcher() {
  const { theme: t } = useTheme();
  const pathname = usePathname();

  const currentView = pathname.startsWith('/parent')
    ? 'parent'
    : pathname.startsWith('/hub')
      ? 'child'
      : 'public';

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] ${t.card} border ${t.border} p-1 rounded-full shadow-2xl flex gap-1 backdrop-blur-xl`}>
      {VIEWS.map((v) => (
        <Link
          key={v.id}
          href={v.href}
          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
            currentView === v.id
              ? `bg-gradient-to-r ${t.gradient} text-white shadow-lg`
              : `${t.muted}`
          }`}
        >
          {v.label}
        </Link>
      ))}
    </div>
  );
}
