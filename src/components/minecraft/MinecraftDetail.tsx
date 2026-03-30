'use client';

import Image from 'next/image';
import Link from 'next/link';
import { X } from 'lucide-react';
import { ViewSwitcher } from '@/components/shared/ViewSwitcher';
import type { ContentItem } from '@/lib/constants';

interface MinecraftDetailProps {
  item: ContentItem;
}

export function MinecraftDetail({ item }: MinecraftDetailProps) {
  return (
    <div className="mc-bg mc-font min-h-screen text-white relative overflow-hidden flex items-center justify-center p-4">
      <div className="mc-overlay" />

      <div className="mc-glass bg-black/80 w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col md:flex-row relative shadow-[8px_8px_0px_rgba(0,0,0,0.8)] z-10">
        <Link
          href="/"
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/50 border-2 border-white/50 flex items-center justify-center hover:bg-[#FF5555] hover:border-[#AA0000] transition-colors"
        >
          <X className="w-4 h-4 text-white drop-shadow-md" />
        </Link>

        {/* Image side */}
        <div className="md:w-1/2 p-3 bg-black/40 relative flex flex-col border-r-0 md:border-r-4 border-white/20">
          <div className="flex-1 mc-glass overflow-hidden relative shadow-inner p-1 min-h-[200px]">
            <Image
              src={item.thumbnail}
              alt={item.title}
              fill
              className="object-cover border-2 border-black"
              sizes="50vw"
              priority
            />
            <div className="absolute top-3 left-3 mc-grass-block px-2 py-0.5 text-[10px] font-bold mc-text-shadow-sm shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
              {item.category}
            </div>
          </div>
        </div>

        {/* Story side */}
        <div className="md:w-1/2 p-4 lg:p-6 overflow-y-auto">
          <h2 className="text-lg lg:text-xl font-mc mb-4 leading-tight text-[#55FFFF] mc-text-shadow">
            {item.title}
          </h2>

          <div className="space-y-4">
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mc-text-shadow-sm mb-2">
                Lore
              </h4>
              <p className="text-xs text-white bg-black/40 border-2 border-white/20 p-3 leading-relaxed shadow-inner mc-text-shadow-sm">
                &ldquo;{item.story}&rdquo;
              </p>
            </div>

            <div className="pt-4 border-t-2 border-white/20">
              <p className="text-[10px] font-black uppercase text-gray-400 mc-text-shadow-sm mb-1">
                Item Type
              </p>
              <p className="font-mc text-sm text-[#55FF55] mc-text-shadow">
                {item.medium}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ViewSwitcher />
    </div>
  );
}
