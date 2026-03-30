'use client';

export default function ParentError({ reset }: { reset: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0326] via-[#1a0940] to-[#0d1b3e] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-rose-500/20 flex items-center justify-center">
          <span className="text-2xl text-rose-400">!</span>
        </div>
        <h2 className="text-2xl font-black text-indigo-50 mb-3">Something went wrong</h2>
        <p className="text-sm text-indigo-300/70 mb-8 leading-relaxed">
          The dashboard couldn&apos;t load. Check your connection or try again.
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
