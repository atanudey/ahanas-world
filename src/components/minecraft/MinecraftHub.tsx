'use client';

import {
  Sparkles, Award, Rocket, Music, Palette,
  Mic, Camera, PenTool, Book, CheckCircle2,
} from 'lucide-react';
import { ViewSwitcher } from '@/components/shared/ViewSwitcher';

const CAPTURE_ACTIONS = [
  { icon: Mic, label: 'Sing' },
  { icon: Camera, label: 'Photo' },
  { icon: PenTool, label: 'Draw' },
  { icon: Book, label: 'Read' },
];

const MISSIONS = [
  { text: 'Practice Nebula melody', xp: 50, done: false },
  { text: 'Pick a color for Mars', xp: 30, done: true },
  { text: 'Read the Moon Story', xp: 20, done: false },
];

const BADGE_ITEMS = [
  { icon: Award, color: 'text-[#FFFF55]' },
  { icon: Rocket, color: 'text-[#55FFFF]' },
  { icon: Music, color: 'text-[#FF55FF]' },
  { icon: Palette, color: 'text-[#55FF55]' },
];

const MOBS = [
  // Steve — top-left, peeking beside the header
  { src: '/mobs/steve.png', alt: 'Steve', className: 'top-[12%] left-[1%] z-20', height: 'h-24 lg:h-32', delay: '0s' },
  // Pig — bottom-left
  { src: '/mobs/pig.png', alt: 'Pig', className: 'bottom-[8%] left-[5%]', height: 'h-10 lg:h-14', delay: '0.8s' },
  // Cat — right side, mid-height
  { src: '/mobs/cat.png', alt: 'Cat', className: 'top-[40%] right-[1%]', height: 'h-8 lg:h-12', delay: '0.4s' },
  // Fox — top-right corner
  { src: '/mobs/fox.png', alt: 'Fox', className: 'top-[8%] right-[2%]', height: 'h-8 lg:h-12', delay: '1.2s' },
  // Ocelot — bottom-right
  { src: '/mobs/ocelot.png', alt: 'Ocelot', className: 'bottom-[10%] right-[4%]', height: 'h-8 lg:h-10', delay: '1.6s' },
  // Piglet — bottom-center
  { src: '/mobs/pig.png', alt: 'Piglet', className: 'bottom-[5%] left-[46%]', height: 'h-8 lg:h-12', delay: '1s' },
  // Another cat — left side, lower
  { src: '/mobs/cat.png', alt: 'Kitten', className: 'bottom-[25%] left-[1%]', height: 'h-7 lg:h-10', delay: '2s' },
];

export function MinecraftHub() {
  return (
    <div className="mc-bg mc-font h-screen text-white relative overflow-hidden flex flex-col">
      <div className="mc-overlay" />

      {/* Mobs — bottom of screen */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
        {MOBS.map((mob, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={mob.src}
            alt={mob.alt}
            className={`absolute animate-mob-breathe drop-shadow-[0_6px_8px_rgba(0,0,0,0.6)] ${mob.className} ${mob.height}`}
            style={{ imageRendering: 'pixelated', animationDelay: mob.delay }}
          />
        ))}
      </div>

      {/* Header bar */}
      <header className="relative p-3 flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-3 mc-glass p-2 pr-6">
          <div className="w-9 h-9 mc-inventory-slot flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#FFFF55] drop-shadow-md" />
          </div>
          <h1 className="text-base font-mc text-white mc-text-shadow leading-none">
            Ahana&apos;s Base
          </h1>
        </div>

        <div className="mc-glass px-3 py-1.5 flex items-center gap-2">
          <Award className="text-[#FFFF55] drop-shadow-md w-5 h-5" />
          <div className="text-right">
            <p className="text-[8px] text-gray-300 mc-text-shadow-sm uppercase tracking-widest leading-none">
              XP Level
            </p>
            <p className="text-lg font-mc text-[#55FF55] mc-text-shadow leading-none">
              8
            </p>
          </div>
        </div>
      </header>

      {/* Center content area */}
      <div className="flex-1 flex items-center justify-center z-10 px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-5xl w-full">

          {/* Capture / Crafting */}
          <div className="lg:col-span-5 relative">
            <div className="mc-glass p-5 relative bg-black/60">
              <div className="absolute top-[-10px] left-[-10px] bg-[#FFFF55] border-2 border-[#AAAA00] text-[#3F3F00] px-2 py-0.5 text-[9px] font-bold shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
                CRAFTING
              </div>
              <h2 className="text-lg font-mc text-[#FF5555] mc-text-shadow mb-0.5 mt-2">
                Capture!
              </h2>
              <p className="text-gray-300 mc-text-shadow-sm text-[11px] mb-3">
                What did you craft today?
              </p>
              <div className="grid grid-cols-2 gap-2">
                {CAPTURE_ACTIONS.map((act) => (
                  <button
                    key={act.label}
                    className="mc-wood-block p-2.5 flex flex-col items-center justify-center gap-1.5 hover:brightness-110"
                  >
                    <div className="mc-inventory-slot p-1.5">
                      <act.icon className="w-4 h-4 text-white drop-shadow-md" />
                    </div>
                    <span className="text-xs font-mc mc-text-shadow-sm">
                      {act.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quests / Missions */}
          <div className="lg:col-span-4 relative">
            <div className="mc-glass p-5 bg-black/60 h-full flex flex-col">
              <div className="absolute top-[-10px] left-[-10px] mc-grass-block px-2 py-0.5 text-[9px] font-bold shadow-[2px_2px_0_rgba(0,0,0,0.5)] mc-text-shadow-sm">
                MISSIONS
              </div>
              <h3 className="text-base font-mc text-[#55FFFF] mc-text-shadow mb-3 mt-2">
                Today&apos;s Quest
              </h3>
              <div className="space-y-2 flex-1 flex flex-col justify-center">
                {MISSIONS.map((m, i) => (
                  <div
                    key={i}
                    className={`p-2 flex items-center cursor-pointer border-2 transition-all ${
                      m.done
                        ? 'bg-[#55FF55]/20 border-[#55FF55]'
                        : 'bg-black/40 border-white/20 hover:border-white/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-5 h-5 border-2 flex items-center justify-center shadow-inner shrink-0 ${
                          m.done
                            ? 'bg-[#55FF55] border-[#00AA00]'
                            : 'bg-black/50 border-black'
                        }`}
                      >
                        {m.done && (
                          <CheckCircle2 className="w-3 h-3 text-[#003F00]" />
                        )}
                      </div>
                      <span
                        className={`text-[11px] mc-text-shadow-sm ${
                          m.done ? 'text-[#55FF55]' : 'text-white'
                        }`}
                      >
                        {m.text}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Badges / Advancements */}
          <div className="lg:col-span-3 relative">
            <div className="mc-glass p-5 text-center bg-black/60 h-full flex flex-col">
              <div className="absolute top-[-10px] left-[-10px] bg-[#FF55FF] border-2 border-[#AA00AA] text-[#FFFFFF] mc-text-shadow-sm px-2 py-0.5 text-[9px] font-bold shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
                ADVANCEMENTS
              </div>
              <h3 className="text-base font-mc text-[#FFFF55] mc-text-shadow mb-3 mt-2">
                Badges
              </h3>
              <div className="grid grid-cols-2 gap-2 flex-1 place-content-center">
                {BADGE_ITEMS.map((badge, i) => (
                  <div
                    key={i}
                    className="aspect-square mc-inventory-slot flex items-center justify-center hover:bg-[#a0a0a0] cursor-pointer transition-colors"
                  >
                    <badge.icon
                      className={`w-6 h-6 ${badge.color} drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      <ViewSwitcher />
    </div>
  );
}
