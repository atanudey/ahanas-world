'use client';

import { ContentCard } from './ContentCard';
import type { ContentItem } from '@/lib/constants';

interface ContentGridProps {
  items: ContentItem[];
}

export function ContentGrid({ items }: ContentGridProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-20 opacity-50">
        <p className="text-lg font-medium">Nothing here yet. Stay tuned!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      {items.map((item) => (
        <ContentCard key={item.id} item={item} />
      ))}
    </div>
  );
}
