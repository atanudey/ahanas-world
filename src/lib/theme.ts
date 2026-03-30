export type ThemeMode = 'moonlit' | 'storybook' | 'minecraft';

export interface Theme {
  name: string;
  id: 'dark' | 'light' | 'minecraft';
  bg: string;
  surface: string;
  card: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  accentBg: string;
  highlight: string;
  gradient: string;
  shadow: string;
  texture: string;
  glass: string;
}

export const THEMES: Record<ThemeMode, Theme> = {
  moonlit: {
    name: 'Moonlit Studio',
    id: 'dark',
    bg: 'bg-gradient-to-br from-[#0f0326] via-[#1a0940] to-[#0d1b3e]',
    surface: 'bg-indigo-950/40 backdrop-blur-xl border border-indigo-400/10',
    card: 'bg-gradient-to-br from-indigo-950/50 to-purple-950/40 backdrop-blur-xl border border-indigo-400/15 shadow-xl shadow-purple-500/10',
    border: 'border-indigo-400/15',
    text: 'text-indigo-50',
    muted: 'text-indigo-300/70',
    accent: 'text-violet-400',
    accentBg: 'bg-violet-500/15',
    highlight: 'text-amber-300',
    gradient: 'from-violet-500 via-fuchsia-500 to-rose-500',
    shadow: 'shadow-violet-500/20',
    texture: 'opacity-10 pointer-events-none',
    glass: 'bg-gradient-to-br from-indigo-900/30 to-purple-900/20 backdrop-blur-2xl border border-indigo-400/15 shadow-2xl shadow-purple-900/20',
  },
  storybook: {
    name: 'Storybook Atelier',
    id: 'light',
    bg: 'bg-gradient-to-br from-[#dbeafe] via-[#ede9fe] to-[#d1fae5]',
    surface: 'bg-indigo-950/[0.06] backdrop-blur-xl border border-indigo-900/10 shadow-lg',
    card: 'bg-gradient-to-br from-indigo-950/[0.06] to-purple-950/[0.04] backdrop-blur-xl border border-indigo-900/10 shadow-xl',
    border: 'border-indigo-900/10',
    text: 'text-slate-800',
    muted: 'text-slate-500',
    accent: 'text-violet-600',
    accentBg: 'bg-violet-100/60',
    highlight: 'text-fuchsia-600',
    gradient: 'from-violet-500 via-fuchsia-500 to-rose-500',
    shadow: 'shadow-violet-300/20',
    texture: 'opacity-15 pointer-events-none',
    glass: 'bg-gradient-to-br from-slate-900/[0.07] to-violet-900/[0.05] backdrop-blur-2xl border border-slate-900/10 shadow-2xl',
  },
  minecraft: {
    name: 'Minecraft',
    id: 'minecraft',
    bg: 'mc-bg',
    surface: 'mc-glass',
    card: 'mc-glass',
    border: 'border-white/30',
    text: 'text-white mc-text-shadow',
    muted: 'text-gray-300 mc-text-shadow-sm',
    accent: 'text-[#55FF55] mc-text-shadow',
    accentBg: 'bg-[#55FF55]/20',
    highlight: 'text-[#FFFF55] mc-text-shadow',
    gradient: 'from-[#55FF55] via-[#55FFFF] to-[#FFFF55]',
    shadow: 'shadow-black/50',
    texture: 'opacity-0 pointer-events-none',
    glass: 'mc-glass',
  },
};

export const THEME_ORDER: ThemeMode[] = ['moonlit', 'storybook', 'minecraft'];
