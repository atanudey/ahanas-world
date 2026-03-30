'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Play } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import type { ContentItem } from '@/lib/constants';

interface ContentCardProps {
  item: ContentItem;
}

export function ContentCard({ item }: ContentCardProps) {
  const { theme: t } = useTheme();
  const isSong = item.type === 'song';

  return (
    <Link
      href={`/content/${item.slug}`}
      className={`group liquid-glass ${t.card} rounded-[2.5rem] overflow-hidden transition-all cursor-pointer flex flex-col relative`}
    >
      <div className="aspect-[4/3] relative overflow-hidden">
        <Image
          src={item.thumbnail}
          alt={item.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-1000"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/30">
            {item.category}
          </span>
        </div>
        {isSong && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-teal-900/20 backdrop-blur-[2px]">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-teal-600 shadow-2xl">
              <Play className="fill-current w-6 h-6 translate-x-0.5" />
            </div>
          </div>
        )}
      </div>

      <div className="p-8 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <h3 className={`text-2xl font-black tracking-tight group-hover:text-teal-600 transition leading-tight ${t.text}`}>
            {item.title}
          </h3>
          <ChevronRight className={`w-6 h-6 opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition ${t.text}`} />
        </div>
        <p className={`${t.muted} text-sm font-medium mb-6 line-clamp-2`}>
          {item.description}
        </p>
        <div className={`mt-auto pt-6 border-t ${t.border} flex items-center justify-between opacity-60`}>
          <span className={`text-[10px] font-black uppercase tracking-widest ${t.text}`}>
            {item.medium}
          </span>
          <span className={`text-[10px] font-black uppercase tracking-widest ${t.text}`}>
            {item.date.split('-')[0]}
          </span>
        </div>
      </div>
    </Link>
  );
}
