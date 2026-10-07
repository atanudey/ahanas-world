'use client';

import { Eye } from 'lucide-react';
import type { Theme } from '@/lib/theme';
import { getThumbnailUrl } from '@/lib/utils/storage';
import { MediaPlaceholder } from '@/components/shared/MediaPlaceholder';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ContentRecord = any;

export function ArchiveRoomView({ t, allContent, onOpenDetail }: {
  t: Theme;
  allContent: ContentRecord[];
  onOpenDetail: (id: string) => void;
}) {
  return (
    <>
      <header className="mb-12">
        <h2 className="text-4xl font-black italic mb-2 tracking-tight">Archive Room</h2>
        <p className={`${t.muted} font-medium`}>A collection of all published and past creative works.</p>
      </header>

      {allContent.length === 0 && (
        <p className={`${t.muted} font-medium`}>No creations yet — approved captures will be collected here.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {allContent.map((item: ContentRecord) => {
          const thumbSrc = item.thumbnail_path ? getThumbnailUrl(item.thumbnail_path) : item.thumbnail || null;
          const isDb = !!item.created_at;

          return (
            <button
              type="button"
              key={item.id}
              disabled={!isDb}
              onClick={() => onOpenDetail(item.id)}
              className={`text-left ${t.card} border ${t.border} rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition group backdrop-blur-md disabled:cursor-default`}
            >
              <div className="relative h-48 overflow-hidden">
                {thumbSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumbSrc} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                ) : (
                  <MediaPlaceholder type={item.type} className="w-full h-full" iconClassName="w-12 h-12" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                    item.status === 'published' ? 'bg-emerald-500/80 text-white' :
                    item.status === 'review_needed' ? 'bg-amber-400/80 text-white' :
                    'bg-amber-500/80 text-white'
                  }`}>
                    {item.status === 'review_needed' ? 'needs review' : item.status}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className={`font-bold text-lg mb-1 ${t.text}`}>{item.title}</h3>
                <p className={`text-[10px] font-black uppercase tracking-widest ${t.muted} mb-3`}>
                  {item.category} &bull; {item.medium}
                </p>
                <p className={`text-sm ${t.muted} line-clamp-2 font-medium`}>{item.description}</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-black/5">
                  <span className={`text-xs ${t.muted}`}>{item.date || new Date(item.created_at).toLocaleDateString()}</span>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-teal-500" />
                    <span className="text-xs font-bold text-teal-600">{(item.views || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
