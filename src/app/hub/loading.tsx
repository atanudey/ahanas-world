import { SkeletonBox } from '@/components/shared/Skeleton';

export default function HubLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0326] via-[#1a0940] to-[#0d1b3e] flex items-center justify-center">
      <div className="w-full max-w-lg px-6 space-y-8 text-center">
        <SkeletonBox className="w-24 h-24 mx-auto rounded-3xl" />
        <SkeletonBox className="h-8 w-48 mx-auto" />
        <SkeletonBox className="h-4 w-64 mx-auto" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBox key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
