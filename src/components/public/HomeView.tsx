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
import type { ContentItem } from '@/lib/constants';

/** The home page body; the server page loads `items` and picks the theme-specific layout here. */
export function HomeView({ items }: { items: ContentItem[] }) {
  const { mode, theme: t } = useTheme();

  if (mode === 'minecraft') {
    return <MinecraftPublic section="home" items={items} showHero />;
  }

  return (
    <div className={`min-h-screen ${t.bg} ${t.text} transition-colors duration-700 relative overflow-hidden`}>
      <GradientBlobs />
      <TexturedBackground />
      <PublicNav />
      <HeroSection latestSlug={items[0]?.slug} />
      <div id="latest" className="max-w-7xl mx-auto px-6 py-12 relative">
        <ContentGrid items={items} />
      </div>
      <PublicFooter />
      <ViewSwitcher />
    </div>
  );
}
