'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { ViewSwitcher } from '@/components/shared/ViewSwitcher';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { MOCK_CONTENT, type ContentItem } from '@/lib/constants';

const TABS = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'music', label: 'Songs', href: '/music' },
  { id: 'art', label: 'Sketches', href: '/art' },
  { id: 'space', label: 'Science', href: '/space' },
  { id: 'reading', label: 'Books', href: '/reading' },
  { id: 'milestones', label: 'Journey', href: '/milestones' },
];

function McCard({ item }: { item: ContentItem }) {
  return (
    <Link
      href={`/content/${item.slug}`}
      className="mc-glass relative cursor-pointer hover:border-white transition-all flex flex-col group"
    >
      <div className="absolute top-[-12px] left-[-12px] mc-grass-block px-2 py-0.5 text-[10px] mc-text-shadow-sm font-bold z-20 shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
        {item.category}
      </div>
      <div className="p-2 pb-0">
        <div className="aspect-[4/3] overflow-hidden relative border-2 border-black/50">
          <Image
            src={item.thumbnail}
            alt={item.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <h3 className="text-sm font-mc text-[#55FFFF] mc-text-shadow mb-1 leading-tight">
          {item.title}
        </h3>
        <p className="text-gray-300 text-xs mb-3 line-clamp-2 mc-text-shadow-sm">
          {item.description}
        </p>
        <button className="mc-wood-block px-4 py-1.5 text-xs mt-auto tracking-wide w-full mc-text-shadow-sm">
          Read Story
        </button>
      </div>
    </Link>
  );
}

interface MinecraftPublicProps {
  section?: string;
  sectionTitle?: string;
  showHero?: boolean;
}

export function MinecraftPublic({ section, sectionTitle, showHero = false }: MinecraftPublicProps) {
  const items = MOCK_CONTENT.filter((item) => {
    if (item.visibility !== 'public' || item.status !== 'published') return false;
    if (!section || section === 'home') return true;
    return item.sections.includes(section as never);
  });

  return (
    <div className="mc-bg mc-font min-h-screen text-white relative overflow-hidden">
      <div className="mc-overlay" />

      {/* Nav */}
      <nav className="px-4 py-3 relative z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between mc-glass p-2 px-4">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-lg mc-text-shadow group-hover:-translate-y-1 transition-transform">
              💎
            </span>
            <span className="text-base lg:text-lg font-mc text-[#55FF55] mc-text-shadow tracking-wide">
              Ahana&apos;s World
            </span>
          </Link>

          <div className="hidden lg:flex gap-1">
            {TABS.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className={`px-3 py-1 text-xs font-mc mc-text-shadow-sm transition-all ${
                  (section || 'home') === tab.id
                    ? 'mc-wood-block text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10 border-2 border-transparent'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button className="mc-grass-block px-4 py-1 text-xs mc-text-shadow-sm hidden md:block hover:brightness-110 active:translate-y-0.5">
              Say Hello!
            </button>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-4 relative z-10">
        {/* Hero */}
        {showHero && (
          <header className="text-center mb-8 mc-glass p-6 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 opacity-20">
              <Sparkles className="w-32 h-32 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-mc text-white mc-text-shadow mb-3 leading-tight relative z-10">
              Songs, Sketches <br />
              <span className="text-[#FFFF55]">&amp; Stars!</span>
            </h1>
            <p className="text-sm max-w-xl mx-auto text-gray-200 mc-text-shadow-sm leading-relaxed relative z-10">
              Welcome to my Overworld. A magical place where I sing, craft, and
              explore the universe.
            </p>
            <div className="mt-4 relative z-10">
              <button className="mc-wood-block px-6 py-2 text-sm mc-text-shadow-sm tracking-wide">
                Explore Inventory
              </button>
            </div>
          </header>
        )}

        {/* Section title */}
        {sectionTitle && !showHero && (
          <h1 className="text-xl lg:text-2xl font-mc text-[#FFFF55] mc-text-shadow mb-6 leading-none">
            {sectionTitle}
          </h1>
        )}

        {/* Content grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 mt-4">
          {items.map((item) => (
            <McCard key={item.id} item={item} />
          ))}
        </div>

        {items.length === 0 && (
          <div className="mc-glass p-6 text-center">
            <p className="text-sm font-mc text-gray-300 mc-text-shadow">
              Nothing here yet. Check back soon!
            </p>
          </div>
        )}
      </main>

      <ViewSwitcher />
    </div>
  );
}
