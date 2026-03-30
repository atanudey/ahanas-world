'use client';

import { useTheme } from '@/context/ThemeContext';

export function GradientBlobs() {
  const { mode } = useTheme();

  if (mode === 'minecraft') return null;

  if (mode === 'moonlit') {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="gradient-blob w-[600px] h-[600px] bg-violet-600/25 top-[-15%] left-[-10%]" />
        <div className="gradient-blob-reverse w-[500px] h-[500px] bg-fuchsia-600/20 top-[25%] right-[-8%]" style={{ animationDelay: '5s' }} />
        <div className="gradient-blob w-[400px] h-[400px] bg-rose-600/15 bottom-[-10%] left-[25%]" style={{ animationDelay: '10s' }} />
        <div className="gradient-blob-reverse w-[300px] h-[300px] bg-indigo-500/20 top-[55%] left-[5%]" style={{ animationDelay: '15s' }} />
        <div className="gradient-blob w-[250px] h-[250px] bg-cyan-500/10 top-[10%] right-[20%]" style={{ animationDelay: '8s' }} />
      </div>
    );
  }

  // Storybook — warm, colorful blobs
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="gradient-blob w-[500px] h-[500px] bg-violet-300/40 top-[-10%] right-[-5%]" />
      <div className="gradient-blob-reverse w-[450px] h-[450px] bg-rose-300/30 bottom-[5%] left-[-5%]" style={{ animationDelay: '7s' }} />
      <div className="gradient-blob w-[350px] h-[350px] bg-sky-300/25 top-[35%] left-[40%]" style={{ animationDelay: '12s' }} />
      <div className="gradient-blob-reverse w-[300px] h-[300px] bg-amber-200/30 top-[5%] left-[15%]" style={{ animationDelay: '3s' }} />
      <div className="gradient-blob w-[200px] h-[200px] bg-emerald-300/25 bottom-[20%] right-[15%]" style={{ animationDelay: '9s' }} />
    </div>
  );
}
