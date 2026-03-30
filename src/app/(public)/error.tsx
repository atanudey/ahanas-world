'use client';

export default function PublicError({ reset }: { reset: () => void }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-rose-100 flex items-center justify-center">
          <span className="text-2xl">!</span>
        </div>
        <h2 className="text-2xl font-black mb-3">Something went wrong</h2>
        <p className="text-sm opacity-60 mb-8 leading-relaxed">
          We couldn&apos;t load this page. This might be a temporary issue — try again in a moment.
        </p>
        <button
          onClick={reset}
          className="px-8 py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-rose-500 text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
