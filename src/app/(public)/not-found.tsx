import Link from 'next/link';

export default function PublicNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-violet-500/15 flex items-center justify-center text-2xl">
          ✦
        </div>
        <h1 className="text-3xl font-black mb-3">Nothing here yet</h1>
        <p className="text-sm opacity-60 mb-8 leading-relaxed">
          This creation doesn&apos;t exist or isn&apos;t public yet — it may still be waiting
          for a parent&apos;s review.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-rose-500 text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Back to Ahana&apos;s World
        </Link>
      </div>
    </div>
  );
}
