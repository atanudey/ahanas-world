'use client';

import { useTheme } from '@/context/ThemeContext';
import { PublicNav } from '@/components/public/PublicNav';
import { PublicFooter } from '@/components/public/PublicFooter';
import { TexturedBackground } from '@/components/shared/TexturedBackground';
import { GradientBlobs } from '@/components/shared/GradientBlobs';
import { ViewSwitcher } from '@/components/shared/ViewSwitcher';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const { mode, theme: t } = useTheme();

  if (mode === 'minecraft') {
    return <>{children}</>;
  }

  return (
    <div className={`min-h-screen ${t.bg} ${t.text} transition-colors duration-700 relative overflow-hidden`}>
      <GradientBlobs />
      <TexturedBackground />
      <PublicNav />
      <main className="relative">{children}</main>
      <PublicFooter />
      <ViewSwitcher />
    </div>
  );
}
