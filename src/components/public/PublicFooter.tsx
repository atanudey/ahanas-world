'use client';

import { useTheme } from '@/context/ThemeContext';

export function PublicFooter() {
  const { theme: t } = useTheme();

  return (
    <footer className={`py-20 px-6 text-center border-t ${t.border} mt-24`}>
      <p className={`${t.muted} text-sm font-bold uppercase tracking-widest`}>
        Managed by Parents &bull; Privacy First &bull; &copy; {new Date().getFullYear()}
      </p>
    </footer>
  );
}
