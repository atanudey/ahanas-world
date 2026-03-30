'use client';

import { Plus, Calendar, ChevronRight } from 'lucide-react';
import type { Theme } from '@/lib/theme';

const CALENDAR_EVENTS = [
  { id: 1, title: 'Stars in my Pocket — YouTube Premiere', date: 'Mar 30', time: '3:00 PM', status: 'scheduled' as const },
  { id: 2, title: 'The Mars Garden — Instagram Post', date: 'Apr 2', time: '10:00 AM', status: 'scheduled' as const },
  { id: 3, title: 'Nebula Flow — Final Edit Review', date: 'Apr 5', time: '6:00 PM', status: 'draft' as const },
  { id: 4, title: 'Cosmic Butterfly Garden — Website Feature', date: 'Apr 8', time: '12:00 PM', status: 'scheduled' as const },
  { id: 5, title: 'Book Review: Girl Who Drank the Moon', date: 'Apr 12', time: '2:00 PM', status: 'draft' as const },
];

export function ReleaseCalendarView({ t }: { t: Theme }) {
  return (
    <>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
        <div>
          <h2 className="text-4xl font-black italic mb-2 tracking-tight">Release Calendar</h2>
          <p className={`${t.muted} font-medium`}>Upcoming scheduled releases and deadlines.</p>
        </div>
        <button className={`bg-gradient-to-r ${t.gradient} text-white px-6 py-3 rounded-2xl font-bold shadow-xl flex items-center gap-2`}>
          <Plus className="w-5 h-5" /> Schedule Release
        </button>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className={`xl:col-span-8 ${t.card} border ${t.border} rounded-[2.5rem] p-6 lg:p-8 shadow-sm backdrop-blur-md`}>
          <h3 className={`text-sm font-black uppercase tracking-widest ${t.muted} mb-6`}>Upcoming Releases</h3>
          <div className="space-y-4">
            {CALENDAR_EVENTS.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-5 lg:p-6 bg-black/5 rounded-3xl border border-transparent hover:border-violet-500/20 transition group cursor-pointer">
                <div className="flex items-center gap-4 lg:gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center ${
                    event.status === 'scheduled' ? 'bg-violet-100 text-violet-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    <span className="text-[10px] font-black uppercase leading-none">{event.date.split(' ')[0]}</span>
                    <span className="text-lg font-black leading-tight">{event.date.split(' ')[1]}</span>
                  </div>
                  <div>
                    <p className={`font-bold text-base ${t.text}`}>{event.title}</p>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${t.muted}`}>{event.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    event.status === 'scheduled' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {event.status === 'scheduled' ? 'Scheduled' : 'Draft'}
                  </span>
                  <ChevronRight className={`w-5 h-5 ${t.muted} group-hover:text-violet-500 transition`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-4 space-y-8">
          <div className={`${t.card} border ${t.border} p-8 rounded-[2.5rem] shadow-sm`}>
            <h4 className={`font-bold mb-6 ${t.text}`}>At a Glance</h4>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${t.muted}`}>Scheduled</span>
                <span className="text-2xl font-black text-emerald-600">{CALENDAR_EVENTS.filter((e) => e.status === 'scheduled').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${t.muted}`}>Drafts</span>
                <span className="text-2xl font-black text-amber-500">{CALENDAR_EVENTS.filter((e) => e.status === 'draft').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${t.muted}`}>Next Release</span>
                <span className={`text-sm font-bold ${t.accent}`}>Mar 30</span>
              </div>
            </div>
          </div>

          <div className={`p-8 rounded-[2.5rem] bg-gradient-to-br ${t.gradient} text-white shadow-2xl`}>
            <Calendar className="w-8 h-8 mb-4 opacity-80" />
            <h4 className="font-bold text-lg mb-2">Publishing Tip</h4>
            <p className="text-white/90 text-sm leading-relaxed font-medium">
              Post on weekends between 10 AM — 2 PM for the best engagement on creative content.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
