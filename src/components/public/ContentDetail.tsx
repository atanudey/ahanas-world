'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import type { ContentItem } from '@/lib/constants';

interface ContentDetailProps {
  item: ContentItem;
}

export function ContentDetail({ item }: ContentDetailProps) {
  const { theme: t } = useTheme();

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Link
          href="/"
          className={`inline-flex items-center gap-2 ${t.muted} hover:${t.text} font-bold text-sm mb-8 transition`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to World
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className={`${t.card} border ${t.border} rounded-[3.5rem] overflow-hidden shadow-2xl ${t.shadow}`}>
          <div className="flex flex-col md:flex-row">
            {/* Media side */}
            <div className="md:w-3/5 relative aspect-[4/3] md:aspect-auto md:min-h-[600px] bg-slate-900">
              <Image
                src={item.thumbnail}
                alt={item.title}
                fill
                className="object-cover opacity-80"
                sizes="(max-width: 768px) 100vw, 60vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-teal-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-12 left-12 right-12">
                <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter mb-4">
                  {item.title}
                </h1>
                <div className="flex gap-3 flex-wrap">
                  {item.platforms.map((p) => (
                    <span
                      key={p}
                      className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold text-white border border-white/30 uppercase tracking-widest"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Story side */}
            <div className="md:w-2/5 p-8 md:p-12 overflow-y-auto">
              <div className="space-y-12">
                <section>
                  <h4 className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-4">
                    The Story Behind
                  </h4>
                  <p className={`text-xl font-medium leading-relaxed italic ${t.text}`}>
                    &ldquo;{item.story}&rdquo;
                  </p>
                </section>

                <section className="p-8 rounded-[2rem] bg-teal-50 border border-teal-100">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-5 h-5 text-teal-600" />
                    <h4 className="font-black uppercase text-[10px] tracking-widest text-teal-800">
                      Inspiration Detail
                    </h4>
                  </div>
                  <p className="text-sm font-medium leading-relaxed text-teal-900">
                    {item.description}
                  </p>
                </section>

                <div className={`pt-8 border-t ${t.border} grid grid-cols-2 gap-8`}>
                  <div>
                    <p className="text-[10px] font-black uppercase opacity-50 mb-1">Medium</p>
                    <p className={`font-bold text-sm ${t.text}`}>{item.medium}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase opacity-50 mb-1">Discovery Count</p>
                    <p className="font-bold text-sm text-teal-600">
                      {item.views.toLocaleString()} sparks
                    </p>
                  </div>
                </div>

                <button
                  className={`w-full py-5 bg-gradient-to-r ${t.gradient} text-white rounded-[2rem] font-black text-lg shadow-xl hover:scale-[1.02] transition active:scale-95 shadow-teal-500/20`}
                >
                  Share Ahana&apos;s Light
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
