'use client';

import { useTheme } from '@/context/ThemeContext';
import { ContentGrid } from '@/components/public/ContentGrid';
import { MinecraftPublic } from '@/components/minecraft/MinecraftPublic';
import { MOCK_CONTENT, type SectionId } from '@/lib/constants';

interface SectionPageProps {
  section: SectionId;
  title: string;
}

export function SectionPage({ section, title }: SectionPageProps) {
  const { mode } = useTheme();

  if (mode === 'minecraft') {
    return <MinecraftPublic section={section} sectionTitle={title} />;
  }

  const items = MOCK_CONTENT.filter(
    (item) =>
      item.visibility === 'public' &&
      item.status === 'published' &&
      item.sections.includes(section)
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-12">
        {title}
      </h1>
      <ContentGrid items={items} />
    </div>
  );
}
