import { SkeletonRow, SkeletonBox } from '@/components/shared/Skeleton';

export default function ParentLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0326] via-[#1a0940] to-[#0d1b3e] flex">
      {/* Sidebar skeleton */}
      <aside className="w-72 border-r border-indigo-400/15 p-8 hidden lg:flex flex-col gap-4">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse" />
          <div className="h-4 w-24 rounded bg-white/5 animate-pulse" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 rounded-xl bg-white/5 animate-pulse" />
        ))}
      </aside>

      {/* Main content skeleton */}
      <main className="flex-1 p-8 lg:p-12 space-y-8">
        <div className="space-y-3 mb-12">
          <SkeletonBox className="h-10 w-64" />
          <SkeletonBox className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-8 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
          <div className="xl:col-span-4 space-y-8">
            <SkeletonBox className="h-48" />
            <SkeletonBox className="h-64" />
          </div>
        </div>
      </main>
    </div>
  );
}
