'use client';

export function SkeletonBox({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-2xl bg-gradient-to-r from-white/5 via-white/10 to-white/5 ${className}`} />
  );
}

export function SkeletonText({ className = '', lines = 1 }: { className?: string; lines?: number }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse h-3 rounded-full bg-gradient-to-r from-white/5 via-white/10 to-white/5"
          style={{ width: i === lines - 1 && lines > 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-[2.5rem] border border-white/5 p-6 space-y-4 animate-pulse">
      <SkeletonBox className="h-48 w-full" />
      <SkeletonText lines={2} />
      <SkeletonBox className="h-4 w-24" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 bg-black/5 rounded-3xl animate-pulse">
      <SkeletonBox className="w-16 h-16 shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonBox className="h-4 w-3/4" />
        <SkeletonBox className="h-3 w-1/2" />
      </div>
      <SkeletonBox className="w-16 h-6" />
    </div>
  );
}
