'use client';

import Image from 'next/image';
import { Pickaxe, Plus, Settings } from 'lucide-react';
import { ViewSwitcher } from '@/components/shared/ViewSwitcher';
import { MOCK_CONTENT } from '@/lib/constants';

const SIDEBAR_LINKS = ['Creative Pulse', 'Release Calendar', 'Studio Notes', 'Archive'];

export function MinecraftParent() {
  return (
    <div className="mc-bg mc-font min-h-screen text-white relative overflow-hidden">
      <div className="mc-overlay" />

      <div className="min-h-screen bg-black/60 backdrop-blur-md flex relative z-10">
        {/* Sidebar */}
        <aside className="w-48 lg:w-56 mc-glass p-4 flex-col hidden lg:flex border-l-0 border-t-0 border-b-0 border-r-4 border-r-white/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 mc-wood-block flex items-center justify-center text-white">
              <Pickaxe className="w-6 h-6 drop-shadow-md" />
            </div>
            <p className="text-sm font-mc text-[#FF5555] mc-text-shadow">
              Admin HQ
            </p>
          </div>
          <nav className="space-y-2">
            {SIDEBAR_LINKS.map((link) => (
              <button
                key={link}
                className={`w-full text-left px-3 py-2 text-xs mc-text-shadow-sm transition-all ${
                  link === 'Creative Pulse'
                    ? 'mc-grass-block text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10 border-2 border-transparent'
                }`}
              >
                {link}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 mc-glass p-4 gap-3">
            <div>
              <h2 className="text-xl lg:text-2xl font-mc text-white mc-text-shadow mb-1">
                The Release Queue
              </h2>
              <p className="text-gray-300 mc-text-shadow-sm text-xs">
                Managing Ahana&apos;s blocks.
              </p>
            </div>
            <button className="mc-grass-block px-4 py-2 text-xs mc-text-shadow-sm flex items-center gap-2 hover:brightness-110">
              <Plus className="w-4 h-4" /> Add New Block
            </button>
          </header>

          <div className="mc-glass p-4">
            <div className="space-y-3">
              {MOCK_CONTENT.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-black/40 border-2 border-white/10 hover:border-white/50 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      width={48}
                      height={48}
                      className="w-10 h-10 lg:w-12 lg:h-12 border-2 border-black object-cover"
                    />
                    <div>
                      <p className="text-sm font-mc text-[#55FFFF] mc-text-shadow">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-gray-300 mc-text-shadow-sm uppercase tracking-wide">
                        {item.category} &bull; {item.medium}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 border-2 text-[10px] mc-text-shadow-sm ${
                        item.status === 'published'
                          ? 'bg-[#55FF55]/20 border-[#55FF55] text-[#55FF55]'
                          : 'bg-[#FFFF55]/20 border-[#FFFF55] text-[#FFFF55]'
                      }`}
                    >
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                    <Settings className="w-4 h-4 text-gray-300 hover:text-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <ViewSwitcher />
    </div>
  );
}
