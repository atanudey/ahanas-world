import { SkeletonCard, SkeletonBox } from '@/components/shared/Skeleton';

export default function PublicLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0326] via-[#1a0940] to-[#0d1b3e]">
      {/* Nav skeleton */}
      <div className="h-16 border-b border-white/5" />

      <div className="max-w-7xl mx-auto px-6 py-16 space-y-12">
        {/* Header skeleton */}
        <div className="text-center space-y-4">
          <SkeletonBox className="h-12 w-72 mx-auto" />
          <SkeletonBox className="h-4 w-96 mx-auto" />
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
