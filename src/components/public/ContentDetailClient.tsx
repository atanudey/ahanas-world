'use client';

import { useTheme } from '@/context/ThemeContext';
import { ContentDetail } from '@/components/public/ContentDetail';
import { MinecraftDetail } from '@/components/minecraft/MinecraftDetail';
import type { ContentItem } from '@/lib/constants';

/** Picks the theme-specific detail layout; the server page has already loaded `item`. */
export function ContentDetailClient({ item }: { item: ContentItem }) {
  const { mode } = useTheme();

  if (mode === 'minecraft') {
    return <MinecraftDetail item={item} />;
  }

  return <ContentDetail item={item} />;
}
