'use client';

import { useTheme } from '@/context/ThemeContext';
import { ContentGrid } from '@/components/public/ContentGrid';
import { MinecraftPublic } from '@/components/minecraft/MinecraftPublic';
import type { ContentItem, SectionId } from '@/lib/constants';

interface SectionPageProps {
  section: SectionId;
  title: string;
  items: ContentItem[];
}

export function SectionPage({ section, title, items }: SectionPageProps) {
  const { mode } = useTheme();

  if (mode === 'minecraft') {
    return <MinecraftPublic section={section} sectionTitle={title} items={items} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-12">
        {title}
      </h1>
      <ContentGrid items={items} />
    </div>
  );
}
