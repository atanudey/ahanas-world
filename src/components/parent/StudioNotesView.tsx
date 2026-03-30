'use client';

import { Plus, Star } from 'lucide-react';
import type { Theme } from '@/lib/theme';

const STUDIO_NOTES = [
  { id: 1, date: 'Mar 28, 2026', title: 'Stage fright breakthrough', body: 'Ahana conquered her stage fright today at the school recital. She said "the butterflies turned into rockets" — her words!', mood: '🚀' },
  { id: 2, date: 'Mar 25, 2026', title: 'New melody discovered', body: 'Found her humming a new tune while painting. She called it "Saturn\'s Lullaby." Need to capture it before she forgets.', mood: '🎵' },
  { id: 3, date: 'Mar 22, 2026', title: 'Color mixing experiment', body: 'Spent 2 hours mixing watercolors to find "the exact color of the Milky Way." Settled on a violet-teal blend. Beautiful.', mood: '🎨' },
  { id: 4, date: 'Mar 18, 2026', title: 'Reading streak — 30 days!', body: 'She finished her 30-day reading streak. Celebrated with a trip to the bookstore. Picked up 3 new space books.', mood: '📚' },
  { id: 5, date: 'Mar 14, 2026', title: 'Dance practice observation', body: 'Her contemporary dance is getting more expressive. The Nebula Flow choreography is almost ready for filming.', mood: '💃' },
];

export function StudioNotesView({ t }: { t: Theme }) {
  return (
    <>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
        <div>
          <h2 className="text-4xl font-black italic mb-2 tracking-tight">Studio Notes</h2>
          <p className={`${t.muted} font-medium`}>A private journal of Ahana&apos;s creative moments.</p>
        </div>
        <button className={`bg-gradient-to-r ${t.gradient} text-white px-6 py-3 rounded-2xl font-bold shadow-xl flex items-center gap-2`}>
          <Plus className="w-5 h-5" /> New Note
        </button>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-6">
          {STUDIO_NOTES.map((note) => (
            <div key={note.id} className={`${t.card} border ${t.border} rounded-[2.5rem] p-6 lg:p-8 shadow-sm backdrop-blur-md hover:shadow-lg transition cursor-pointer group`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${t.muted} mb-2`}>{note.date}</p>
                  <h3 className={`text-xl font-black ${t.text}`}>{note.title}</h3>
                </div>
                <span className="text-2xl">{note.mood}</span>
              </div>
              <p className={`${t.muted} text-sm leading-relaxed font-medium`}>{note.body}</p>
            </div>
          ))}
        </div>

        <div className="xl:col-span-4 space-y-8">
          <div className={`${t.card} border ${t.border} p-8 rounded-[2.5rem] shadow-sm`}>
            <h4 className={`font-bold mb-6 ${t.text}`}>Journal Stats</h4>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${t.muted}`}>Total Notes</span>
                <span className="text-2xl font-black text-violet-600">{STUDIO_NOTES.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${t.muted}`}>This Month</span>
                <span className="text-2xl font-black text-emerald-600">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${t.muted}`}>Streak</span>
                <span className={`text-sm font-bold ${t.accent}`}>5 weeks</span>
              </div>
            </div>
          </div>

          <div className={`p-8 rounded-[2.5rem] bg-gradient-to-br ${t.gradient} text-white shadow-2xl`}>
            <Star className="w-8 h-8 mb-4 opacity-80" />
            <h4 className="font-bold text-lg mb-2">Favorite Moment</h4>
            <p className="text-white/90 text-sm leading-relaxed font-medium">
              &ldquo;The butterflies turned into rockets&rdquo; — Ahana, on conquering stage fright.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
