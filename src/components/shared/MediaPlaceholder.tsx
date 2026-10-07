'use client';

import Image from 'next/image';
import { Award, BookOpen, Music, Palette, Rocket, Sparkles, Video } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ContentItem } from '@/lib/constants';

const TYPE_ICONS: Record<string, LucideIcon> = {
  song: Music,
  video: Video,
  art: Palette,
  reading: BookOpen,
  space_science: Rocket,
  milestone: Award,
  default: Sparkles,
};

/** Soft gradient tile with the content type's icon, for items without a thumbnail. */
export function MediaPlaceholder({
  type,
  className = '',
  iconClassName = 'w-10 h-10',
}: {
  type: string;
  className?: string;
  iconClassName?: string;
}) {
  const Icon = TYPE_ICONS[type in TYPE_ICONS ? type : 'default'];
  return (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center bg-gradient-to-br from-violet-500/70 via-fuchsia-500/60 to-rose-500/70 ${className}`}
    >
      <Icon className={`${iconClassName} text-white/85 drop-shadow-md`} />
    </div>
  );
}

/** Fills its positioned parent with the item's thumbnail, or a placeholder when it has none. */
export function Thumbnail({
  item,
  sizes,
  priority = false,
  className = '',
}: {
  item: Pick<ContentItem, 'thumbnail' | 'title' | 'type'>;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  if (!item.thumbnail) {
    return <MediaPlaceholder type={item.type} className={`absolute inset-0 ${className}`} iconClassName="w-14 h-14" />;
  }
  return (
    <Image
      src={item.thumbnail}
      alt={item.title}
      fill
      priority={priority}
      sizes={sizes}
      // App-served files redirect to a signed URL, which the optimizer can't follow.
      unoptimized={item.thumbnail.startsWith('/api/')}
      className={`object-cover ${className}`}
    />
  );
}
