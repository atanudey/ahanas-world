'use client';

import { useState } from 'react';
import { Plus, Clock, AlertTriangle, Settings } from 'lucide-react';
import type { Theme } from '@/lib/theme';
import { getThumbnailUrl } from '@/lib/utils/storage';
import { MOCK_CONTENT } from '@/lib/constants';

const PRACTICE_DATA = [
  { type: 'Singing', current: 4, goal: 5 },
  { type: 'Painting', current: 4, goal: 5 },
  { type: 'Dancing', current: 2, goal: 4 },
  { type: 'Reading', current: 3, goal: 3 },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ContentRecord = any;

export function CreativePulseView({ t, allContent, loading, onOpenDetail, onRefresh }: {
  t: Theme;
  allContent: ContentRecord[];
  loading: boolean;
  onOpenDetail: (id: string) => void;
  onRefresh: () => void;
}) {
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newType, setNewType] = useState('art');
  const [creating, setCreating] = useState(false);

  const handleCreateEntry = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const formData = new FormData();
      formData.append('type', newType);
      formData.append('title', newTitle.trim());
      formData.append('notes', newNotes.trim());
      formData.append('mimeType', '');

      const res = await fetch('/api/content/upload', { method: 'POST', body: formData });
      if (res.ok) {
        setShowNewEntry(false);
        setNewTitle('');
        setNewNotes('');
        onRefresh();
      }
    } finally {
      setCreating(false);
    }
  };

  const reviewCount = allContent.filter((i: ContentRecord) => i.status === 'review_needed').length;

  return (
    <>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
        <div>
          <h2 className="text-4xl font-black italic mb-2 tracking-tight">
            The release queue
          </h2>
          <p className={`${t.muted} font-medium`}>
            Managing Ahana&apos;s creative releases.
            {reviewCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                <AlertTriangle className="w-3 h-3" /> {reviewCount} pending review
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => setShowNewEntry(!showNewEntry)}
          className={`bg-gradient-to-r ${t.gradient} text-white px-6 py-3 rounded-2xl font-bold shadow-xl flex items-center gap-2`}
        >
          <Plus className="w-5 h-5" /> New Studio Entry
        </button>
      </header>

      {showNewEntry && (
        <div className={`${t.card} border ${t.border} rounded-[2rem] p-6 mb-8 backdrop-blur-md`}>
          <h3 className={`font-bold mb-4 ${t.text}`}>Create New Entry</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-300 transition"
            />
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-300 transition bg-white"
            >
              <option value="art">Art / Drawing</option>
              <option value="song">Song / Audio</option>
              <option value="video">Video</option>
              <option value="reading">Reading Reflection</option>
            </select>
          </div>
          <textarea
            placeholder="Notes or description..."
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium resize-none focus:outline-none focus:ring-2 focus:ring-violet-300 transition mb-4"
          />
          <div className="flex gap-3">
            <button
              onClick={handleCreateEntry}
              disabled={creating || !newTitle.trim()}
              className={`bg-gradient-to-r ${t.gradient} text-white px-6 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50`}
            >
              {creating ? 'Creating...' : 'Create Entry'}
            </button>
            <button
              onClick={() => setShowNewEntry(false)}
              className="px-6 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className={`xl:col-span-8 ${t.card} border ${t.border} rounded-[2.5rem] p-6 lg:p-8 shadow-sm backdrop-blur-md`}>
          {loading && (
            <div className="text-center py-8">
              <p className={`${t.muted} text-sm font-medium`}>Loading content...</p>
            </div>
          )}
          <div className="space-y-4">
            {allContent.map((item: ContentRecord) => {
              const thumbSrc = item.thumbnail_path
                ? getThumbnailUrl(item.thumbnail_path)
                : item.thumbnail || 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600';
              const isDb = !!item.media_path || !!item.thumbnail_path;

              return (
                <div
                  key={item.id}
                  onClick={() => isDb ? onOpenDetail(item.id) : undefined}
                  className={`flex items-center justify-between p-4 lg:p-6 bg-black/5 rounded-3xl border ${
                    item.status === 'review_needed'
                      ? 'border-amber-300/40 bg-amber-50/30'
                      : 'border-transparent'
                  } hover:border-emerald-500/20 transition group cursor-pointer`}
                >
                  <div className="flex items-center gap-4 lg:gap-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumbSrc}
                      alt={item.title}
                      className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl object-cover shadow-md bg-slate-200"
                    />
                    <div>
                      <p className={`font-bold text-base lg:text-lg ${t.text}`}>{item.title}</p>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${t.muted}`}>
                        {item.category} &bull; {item.medium}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 lg:gap-8">
                    <div className="text-right hidden sm:block">
                      <p className={`text-[10px] font-black uppercase tracking-widest ${t.muted}`}>Status</p>
                      <p className={`text-xs font-bold ${
                        item.status === 'published' ? 'text-emerald-600' :
                        item.status === 'review_needed' ? 'text-amber-600' :
                        item.status === 'failed' ? 'text-red-500' :
                        'text-amber-500'
                      }`}>
                        {item.status === 'review_needed' ? 'Needs Review' :
                         item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </p>
                    </div>
                    <Settings className={`w-5 h-5 ${t.muted} group-hover:text-emerald-500`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="xl:col-span-4 space-y-8">
          <div className={`p-8 rounded-[2.5rem] bg-gradient-to-br ${t.gradient} text-white shadow-2xl relative overflow-hidden`}>
            <h4 className="font-bold text-xl mb-4">Discovery Spark</h4>
            <p className="text-white/90 text-sm leading-relaxed mb-6 font-medium">
              {reviewCount > 0
                ? `${reviewCount} new capture${reviewCount > 1 ? 's' : ''} from Ahana waiting for your review!`
                : `Space Corner views grew 14% this week. Followers are responding deeply to the reading reflects.`}
            </p>
            <button className="bg-white/20 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/30 transition">
              View Details
            </button>
          </div>

          <div className={`${t.card} border ${t.border} p-8 rounded-[2.5rem] shadow-sm`}>
            <h4 className={`font-bold mb-6 flex items-center gap-2 ${t.text}`}>
              <Clock className="w-5 h-5 text-teal-500" /> Weekly Practice
            </h4>
            <div className="space-y-6">
              {PRACTICE_DATA.map(({ type, current, goal }) => (
                <div key={type}>
                  <div className="flex justify-between text-xs font-bold uppercase mb-2">
                    <span className={t.text}>{type}</span>
                    <span className={t.muted}>{current}h / {goal}h</span>
                  </div>
                  <div className="w-full h-3 bg-black/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${t.gradient}`}
                      style={{ width: `${(current / goal) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
