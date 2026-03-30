'use client';

import { useTheme } from '@/context/ThemeContext';
import { PublicNav } from '@/components/public/PublicNav';
import { PublicFooter } from '@/components/public/PublicFooter';
import { TexturedBackground } from '@/components/shared/TexturedBackground';
import { GradientBlobs } from '@/components/shared/GradientBlobs';
import { ViewSwitcher } from '@/components/shared/ViewSwitcher';
import { HeroSection } from '@/components/public/HeroSection';
import { ContentGrid } from '@/components/public/ContentGrid';
import { MinecraftPublic } from '@/components/minecraft/MinecraftPublic';
import { MOCK_CONTENT } from '@/lib/constants';

const publicContent = MOCK_CONTENT.filter(
  (item) => item.visibility === 'public' && item.status === 'published'
);

export default function HomePage() {
  const { mode, theme: t } = useTheme();

  if (mode === 'minecraft') {
    return <MinecraftPublic section="home" showHero />;
  }

  return (
    <div className={`min-h-screen ${t.bg} ${t.text} transition-colors duration-700 relative overflow-hidden`}>
      <GradientBlobs />
      <TexturedBackground />
      <PublicNav />
      <HeroSection />
      <div className="max-w-7xl mx-auto px-6 py-12 relative">
        <ContentGrid items={publicContent} />
      </div>
      <PublicFooter />
      <ViewSwitcher />
    </div>
  );
}
