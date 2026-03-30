'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheck, Plus, Clock, Settings, LogOut,
  Calendar, FileText, Archive, BarChart3,
  TrendingUp, Eye, Heart, Users,
  ChevronRight, Star, Wifi, WifiOff,
  Check, AlertTriangle, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { ViewSwitcher } from '@/components/shared/ViewSwitcher';
import { GradientBlobs } from '@/components/shared/GradientBlobs';
import { MinecraftParent } from '@/components/minecraft/MinecraftParent';
import { MOCK_CONTENT } from '@/lib/constants';
import { ContentDetailPanel } from '@/components/parent/ContentDetailPanel';
import { getThumbnailUrl, getMediaUrl } from '@/lib/utils/storage';

type SidebarSection =
  | 'Creative Pulse'
  | 'Release Calendar'
  | 'Studio Notes'
  | 'Archive Room'
  | 'Discovery Insights'
  | 'Publish Settings';

const SIDEBAR_LINKS: { label: SidebarSection; icon: typeof Calendar }[] = [
  { label: 'Creative Pulse', icon: Clock },
  { label: 'Release Calendar', icon: Calendar },
  { label: 'Studio Notes', icon: FileText },
  { label: 'Archive Room', icon: Archive },
  { label: 'Discovery Insights', icon: BarChart3 },
  { label: 'Publish Settings', icon: Settings },
];

const PRACTICE_DATA = [
  { type: 'Singing', current: 4, goal: 5 },
  { type: 'Painting', current: 4, goal: 5 },
  { type: 'Dancing', current: 2, goal: 4 },
  { type: 'Reading', current: 3, goal: 3 },
];

const CALENDAR_EVENTS = [
  { id: 1, title: 'Stars in my Pocket — YouTube Premiere', date: 'Mar 30', time: '3:00 PM', status: 'scheduled' as const },
  { id: 2, title: 'The Mars Garden — Instagram Post', date: 'Apr 2', time: '10:00 AM', status: 'scheduled' as const },
  { id: 3, title: 'Nebula Flow — Final Edit Review', date: 'Apr 5', time: '6:00 PM', status: 'draft' as const },
  { id: 4, title: 'Cosmic Butterfly Garden — Website Feature', date: 'Apr 8', time: '12:00 PM', status: 'scheduled' as const },
  { id: 5, title: 'Book Review: Girl Who Drank the Moon', date: 'Apr 12', time: '2:00 PM', status: 'draft' as const },
];

const STUDIO_NOTES = [
  { id: 1, date: 'Mar 28, 2026', title: 'Stage fright breakthrough', body: 'Ahana conquered her stage fright today at the school recital. She said "the butterflies turned into rockets" — her words!', mood: '🚀' },
  { id: 2, date: 'Mar 25, 2026', title: 'New melody discovered', body: 'Found her humming a new tune while painting. She called it "Saturn\'s Lullaby." Need to capture it before she forgets.', mood: '🎵' },
  { id: 3, date: 'Mar 22, 2026', title: 'Color mixing experiment', body: 'Spent 2 hours mixing watercolors to find "the exact color of the Milky Way." Settled on a violet-teal blend. Beautiful.', mood: '🎨' },
  { id: 4, date: 'Mar 18, 2026', title: 'Reading streak — 30 days!', body: 'She finished her 30-day reading streak. Celebrated with a trip to the bookstore. Picked up 3 new space books.', mood: '📚' },
  { id: 5, date: 'Mar 14, 2026', title: 'Dance practice observation', body: 'Her contemporary dance is getting more expressive. The Nebula Flow choreography is almost ready for filming.', mood: '💃' },
];

const ARCHIVED_ITEMS = MOCK_CONTENT.filter((item) => item.status === 'published').slice(0, 4);

const INSIGHTS_DATA = {
  totalSparks: 9280,
  sparksTrend: '+14%',
  followers: 342,
  followersTrend: '+8%',
  topContent: 'First Stage Performance',
  topContentViews: 3200,
  weeklyBreakdown: [
    { label: 'Mon', value: 45 },
    { label: 'Tue', value: 62 },
    { label: 'Wed', value: 38 },
    { label: 'Thu', value: 71 },
    { label: 'Fri', value: 55 },
    { label: 'Sat', value: 89 },
    { label: 'Sun', value: 67 },
  ],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ContentRecord = any;

export default function ParentPage() {
  const { mode, theme: t } = useTheme();
  const [activeSection, setActiveSection] = useState<SidebarSection>('Creative Pulse');
  const [dbContent, setDbContent] = useState<ContentRecord[]>([]);
  const [selectedContent, setSelectedContent] = useState<ContentRecord | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);

  const fetchContent = useCallback(async () => {
    setLoadingContent(true);
    try {
      const res = await fetch('/api/content');
      if (res.ok) {
        const data = await res.json();
        setDbContent(data);
      }
    } catch {
      // API might not be available (no Supabase running) — fall back silently
    } finally {
      setLoadingContent(false);
    }
  }, []);

  useEffect(() => { fetchContent(); }, [fetchContent]);

  const openContentDetail = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/content/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedContent(data);
      }
    } catch { /* silently fail */ }
  }, []);

  // Combine DB content with mock content for display
  const allContent = dbContent.length > 0 ? dbContent : MOCK_CONTENT;

  if (mode === 'minecraft') {
    return <MinecraftParent />;
  }

  return (
    <div className={`min-h-screen ${t.bg} ${t.text} flex transition-all duration-500 relative overflow-hidden`}>
      <GradientBlobs />
      {/* Sidebar */}
      <aside
        className={`w-72 border-r ${t.border} ${t.glass} p-8 flex flex-col hidden lg:flex relative z-10`}
      >
        <div className="flex items-center gap-4 mb-12">
          <div
            className={`w-10 h-10 bg-gradient-to-tr ${t.gradient} rounded-xl flex items-center justify-center text-white`}
          >
            <ShieldCheck className="w-6 h-6" />
          </div>
          <p className="font-black text-sm uppercase tracking-tighter">
            Studio Ledger
          </p>
        </div>

        <nav className="space-y-1">
          {SIDEBAR_LINKS.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => setActiveSection(label)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 ${
                label === activeSection
                  ? `${t.accentBg} ${t.accent} ring-2 ring-indigo-500/30`
                  : `${t.muted} hover:bg-black/5`
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-black/5">
          <Link
            href="/"
            className={`flex items-center gap-3 ${t.muted} font-bold text-xs uppercase tracking-widest`}
          >
            <LogOut className="w-4 h-4" /> Exit Ledger
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto relative">
        {activeSection === 'Creative Pulse' && (
          <CreativePulseView t={t} allContent={allContent} loading={loadingContent} onOpenDetail={openContentDetail} onRefresh={fetchContent} />
        )}
        {activeSection === 'Release Calendar' && (
          <ReleaseCalendarView t={t} />
        )}
        {activeSection === 'Studio Notes' && (
          <StudioNotesView t={t} />
        )}
        {activeSection === 'Archive Room' && (
          <ArchiveRoomView t={t} allContent={allContent} onOpenDetail={openContentDetail} />
        )}
        {activeSection === 'Discovery Insights' && (
          <DiscoveryInsightsView t={t} />
        )}
        {activeSection === 'Publish Settings' && (
          <PublishSettingsView t={t} />
        )}
      </main>

      {/* Content Detail Panel */}
      {selectedContent && (
        <ContentDetailPanel
          content={selectedContent}
          onClose={() => setSelectedContent(null)}
          onUpdate={() => { fetchContent(); setSelectedContent(null); }}
        />
      )}

      <ViewSwitcher />
    </div>
  );
}

/* ─── Creative Pulse View (uses real data when available) ─── */
function CreativePulseView({ t, allContent, loading, onOpenDetail, onRefresh }: {
  t: ReturnType<typeof useTheme>['theme'];
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

      {/* New Studio Entry Form */}
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
        <div
          className={`xl:col-span-8 ${t.card} border ${t.border} rounded-[2.5rem] p-6 lg:p-8 shadow-sm backdrop-blur-md`}
        >
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
                      <p className={`font-bold text-base lg:text-lg ${t.text}`}>
                        {item.title}
                      </p>
                      <p
                        className={`text-[10px] font-black uppercase tracking-widest ${t.muted}`}
                      >
                        {item.category} &bull; {item.medium}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 lg:gap-8">
                    <div className="text-right hidden sm:block">
                      <p
                        className={`text-[10px] font-black uppercase tracking-widest ${t.muted}`}
                      >
                        Status
                      </p>
                      <p
                        className={`text-xs font-bold ${
                          item.status === 'published' ? 'text-emerald-600' :
                          item.status === 'review_needed' ? 'text-amber-600' :
                          item.status === 'failed' ? 'text-red-500' :
                          'text-amber-500'
                        }`}
                      >
                        {item.status === 'review_needed' ? 'Needs Review' :
                         item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </p>
                    </div>
                    <Settings
                      className={`w-5 h-5 ${t.muted} group-hover:text-emerald-500`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="xl:col-span-4 space-y-8">
          <div
            className={`p-8 rounded-[2.5rem] bg-gradient-to-br ${t.gradient} text-white shadow-2xl relative overflow-hidden`}
          >
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

          <div
            className={`${t.card} border ${t.border} p-8 rounded-[2.5rem] shadow-sm`}
          >
            <h4
              className={`font-bold mb-6 flex items-center gap-2 ${t.text}`}
            >
              <Clock className="w-5 h-5 text-teal-500" /> Weekly Practice
            </h4>
            <div className="space-y-6">
              {PRACTICE_DATA.map(({ type, current, goal }) => (
                <div key={type}>
                  <div className="flex justify-between text-xs font-bold uppercase mb-2">
                    <span className={t.text}>{type}</span>
                    <span className={t.muted}>
                      {current}h / {goal}h
                    </span>
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

/* ─── Release Calendar View ─── */
function ReleaseCalendarView({ t }: { t: ReturnType<typeof useTheme>['theme'] }) {
  return (
    <>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
        <div>
          <h2 className="text-4xl font-black italic mb-2 tracking-tight">
            Release Calendar
          </h2>
          <p className={`${t.muted} font-medium`}>
            Upcoming scheduled releases and deadlines.
          </p>
        </div>
        <button
          className={`bg-gradient-to-r ${t.gradient} text-white px-6 py-3 rounded-2xl font-bold shadow-xl flex items-center gap-2`}
        >
          <Plus className="w-5 h-5" /> Schedule Release
        </button>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className={`xl:col-span-8 ${t.card} border ${t.border} rounded-[2.5rem] p-6 lg:p-8 shadow-sm backdrop-blur-md`}>
          <h3 className={`text-sm font-black uppercase tracking-widest ${t.muted} mb-6`}>
            Upcoming Releases
          </h3>
          <div className="space-y-4">
            {CALENDAR_EVENTS.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-5 lg:p-6 bg-black/5 rounded-3xl border border-transparent hover:border-violet-500/20 transition group cursor-pointer"
              >
                <div className="flex items-center gap-4 lg:gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center ${
                    event.status === 'scheduled'
                      ? 'bg-violet-100 text-violet-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    <span className="text-[10px] font-black uppercase leading-none">{event.date.split(' ')[0]}</span>
                    <span className="text-lg font-black leading-tight">{event.date.split(' ')[1]}</span>
                  </div>
                  <div>
                    <p className={`font-bold text-base ${t.text}`}>{event.title}</p>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${t.muted}`}>
                      {event.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    event.status === 'scheduled'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-600'
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
                <span className="text-2xl font-black text-emerald-600">
                  {CALENDAR_EVENTS.filter((e) => e.status === 'scheduled').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${t.muted}`}>Drafts</span>
                <span className="text-2xl font-black text-amber-500">
                  {CALENDAR_EVENTS.filter((e) => e.status === 'draft').length}
                </span>
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

/* ─── Studio Notes View ─── */
function StudioNotesView({ t }: { t: ReturnType<typeof useTheme>['theme'] }) {
  return (
    <>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
        <div>
          <h2 className="text-4xl font-black italic mb-2 tracking-tight">
            Studio Notes
          </h2>
          <p className={`${t.muted} font-medium`}>
            A private journal of Ahana&apos;s creative moments.
          </p>
        </div>
        <button
          className={`bg-gradient-to-r ${t.gradient} text-white px-6 py-3 rounded-2xl font-bold shadow-xl flex items-center gap-2`}
        >
          <Plus className="w-5 h-5" /> New Note
        </button>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-6">
          {STUDIO_NOTES.map((note) => (
            <div
              key={note.id}
              className={`${t.card} border ${t.border} rounded-[2.5rem] p-6 lg:p-8 shadow-sm backdrop-blur-md hover:shadow-lg transition cursor-pointer group`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${t.muted} mb-2`}>
                    {note.date}
                  </p>
                  <h3 className={`text-xl font-black ${t.text} group-hover:${t.accent} transition`}>
                    {note.title}
                  </h3>
                </div>
                <span className="text-2xl">{note.mood}</span>
              </div>
              <p className={`${t.muted} text-sm leading-relaxed font-medium`}>
                {note.body}
              </p>
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

/* ─── Archive Room View ─── */
function ArchiveRoomView({ t, allContent, onOpenDetail }: {
  t: ReturnType<typeof useTheme>['theme'];
  allContent: ContentRecord[];
  onOpenDetail: (id: string) => void;
}) {
  return (
    <>
      <header className="mb-12">
        <h2 className="text-4xl font-black italic mb-2 tracking-tight">
          Archive Room
        </h2>
        <p className={`${t.muted} font-medium`}>
          A collection of all published and past creative works.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {allContent.map((item: ContentRecord) => {
          const thumbSrc = item.thumbnail_path
            ? getThumbnailUrl(item.thumbnail_path)
            : item.thumbnail || 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600';
          const isDb = !!item.media_path || !!item.thumbnail_path;

          return (
            <div
              key={item.id}
              onClick={() => isDb ? onOpenDetail(item.id) : undefined}
              className={`${t.card} border ${t.border} rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition group cursor-pointer backdrop-blur-md`}
            >
              <div className="relative h-48 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbSrc}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                    item.status === 'published' ? 'bg-emerald-500/80 text-white' :
                    item.status === 'review_needed' ? 'bg-amber-400/80 text-white' :
                    'bg-amber-500/80 text-white'
                  }`}>
                    {item.status === 'review_needed' ? 'needs review' : item.status}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className={`font-bold text-lg mb-1 ${t.text}`}>{item.title}</h3>
                <p className={`text-[10px] font-black uppercase tracking-widest ${t.muted} mb-3`}>
                  {item.category} &bull; {item.medium}
                </p>
                <p className={`text-sm ${t.muted} line-clamp-2 font-medium`}>{item.description}</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-black/5">
                  <span className={`text-xs ${t.muted}`}>{item.date || new Date(item.created_at).toLocaleDateString()}</span>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-teal-500" />
                    <span className="text-xs font-bold text-teal-600">{(item.views || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ─── Discovery Insights View ─── */
function DiscoveryInsightsView({ t }: { t: ReturnType<typeof useTheme>['theme'] }) {
  const maxBar = Math.max(...INSIGHTS_DATA.weeklyBreakdown.map((d) => d.value));

  return (
    <>
      <header className="mb-12">
        <h2 className="text-4xl font-black italic mb-2 tracking-tight">
          Discovery Insights
        </h2>
        <p className={`${t.muted} font-medium`}>
          How Ahana&apos;s creative world is growing.
        </p>
      </header>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        <div className={`${t.card} border ${t.border} p-6 rounded-[2rem] shadow-sm backdrop-blur-md`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <Eye className="w-5 h-5 text-violet-600" />
            </div>
            <span className={`text-xs font-black uppercase tracking-widest ${t.muted}`}>Total Sparks</span>
          </div>
          <p className="text-3xl font-black text-violet-600">{INSIGHTS_DATA.totalSparks.toLocaleString()}</p>
          <p className="text-xs font-bold text-emerald-500 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> {INSIGHTS_DATA.sparksTrend} this week
          </p>
        </div>

        <div className={`${t.card} border ${t.border} p-6 rounded-[2rem] shadow-sm backdrop-blur-md`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
              <Heart className="w-5 h-5 text-rose-500" />
            </div>
            <span className={`text-xs font-black uppercase tracking-widest ${t.muted}`}>Followers</span>
          </div>
          <p className="text-3xl font-black text-rose-500">{INSIGHTS_DATA.followers}</p>
          <p className="text-xs font-bold text-emerald-500 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> {INSIGHTS_DATA.followersTrend} this month
          </p>
        </div>

        <div className={`${t.card} border ${t.border} p-6 rounded-[2rem] shadow-sm backdrop-blur-md`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-500" />
            </div>
            <span className={`text-xs font-black uppercase tracking-widest ${t.muted}`}>Top Content</span>
          </div>
          <p className={`text-sm font-black ${t.text} truncate`}>{INSIGHTS_DATA.topContent}</p>
          <p className={`text-xs font-bold ${t.muted} mt-1`}>
            {INSIGHTS_DATA.topContentViews.toLocaleString()} views
          </p>
        </div>

        <div className={`${t.card} border ${t.border} p-6 rounded-[2rem] shadow-sm backdrop-blur-md`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-teal-600" />
            </div>
            <span className={`text-xs font-black uppercase tracking-widest ${t.muted}`}>Platforms</span>
          </div>
          <p className="text-3xl font-black text-teal-600">3</p>
          <p className={`text-xs font-bold ${t.muted} mt-1`}>YouTube, Instagram, Website</p>
        </div>
      </div>

      {/* Weekly Activity Chart */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className={`xl:col-span-8 ${t.card} border ${t.border} rounded-[2.5rem] p-6 lg:p-8 shadow-sm backdrop-blur-md`}>
          <h3 className={`font-bold mb-8 ${t.text}`}>Weekly Activity</h3>
          <div className="flex items-end justify-between gap-3 h-48">
            {INSIGHTS_DATA.weeklyBreakdown.map((day) => (
              <div key={day.label} className="flex-1 flex flex-col items-center gap-2">
                <span className={`text-xs font-bold ${t.muted}`}>{day.value}</span>
                <div
                  className={`w-full rounded-xl bg-gradient-to-t ${t.gradient} opacity-80 hover:opacity-100 transition`}
                  style={{ height: `${(day.value / maxBar) * 100}%` }}
                />
                <span className={`text-[10px] font-black uppercase ${t.muted}`}>{day.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-4 space-y-8">
          <div className={`p-8 rounded-[2.5rem] bg-gradient-to-br ${t.gradient} text-white shadow-2xl`}>
            <BarChart3 className="w-8 h-8 mb-4 opacity-80" />
            <h4 className="font-bold text-lg mb-2">Growth Insight</h4>
            <p className="text-white/90 text-sm leading-relaxed font-medium">
              Space Corner views grew 14% this week. Followers are responding deeply to the reading reflections.
            </p>
          </div>

          <div className={`${t.card} border ${t.border} p-8 rounded-[2.5rem] shadow-sm`}>
            <h4 className={`font-bold mb-6 ${t.text}`}>Top Performers</h4>
            <div className="space-y-4">
              {MOCK_CONTENT.sort((a, b) => b.views - a.views).slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${t.text} truncate mr-3`}>{item.title}</span>
                  <span className="text-xs font-bold text-teal-600 whitespace-nowrap">{item.views.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Publish Settings View ─── */
function PublishSettingsView({ t }: { t: ReturnType<typeof useTheme>['theme'] }) {
  const [settings, setSettings] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings').then((r) => r.ok ? r.json() : null).then(setSettings).catch(() => {});
  }, []);

  const toggle = async (key: string) => {
    if (!settings) return;
    const newVal = !settings[key];
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: newVal }),
      });
      if (res.ok) setSettings({ ...settings, [key]: newVal });
    } finally {
      setSaving(false);
    }
  };

  const ToggleButton = ({ enabled, onToggle, label }: { enabled: boolean; onToggle: () => void; label: string }) => (
    <button onClick={onToggle} disabled={saving} className="flex items-center justify-between w-full py-4">
      <span className={`text-sm font-bold ${t.text}`}>{label}</span>
      {enabled ? (
        <ToggleRight className="w-8 h-8 text-emerald-500" />
      ) : (
        <ToggleLeft className="w-8 h-8 text-slate-300" />
      )}
    </button>
  );

  return (
    <>
      <header className="mb-12">
        <h2 className="text-4xl font-black italic mb-2 tracking-tight">
          Publish Settings
        </h2>
        <p className={`${t.muted} font-medium`}>
          Configure social media connections and auto-publishing behavior.
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Platform Connections */}
        <div className="xl:col-span-7 space-y-6">
          <div className={`${t.card} border ${t.border} rounded-[2.5rem] p-6 lg:p-8 shadow-sm backdrop-blur-md`}>
            <h3 className={`font-bold mb-6 ${t.text}`}>Connected Platforms</h3>
            <div className="space-y-4">
              {/* Facebook */}
              <div className="flex items-center justify-between p-4 bg-black/5 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-black text-xs">FB</span>
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${t.text}`}>Facebook Page</p>
                    <p className={`text-xs ${t.muted}`}>
                      {settings?.facebook_connected ? (
                        <span className="text-emerald-600 flex items-center gap-1"><Wifi className="w-3 h-3" /> Connected</span>
                      ) : (
                        <span className="text-slate-400 flex items-center gap-1"><WifiOff className="w-3 h-3" /> Not connected</span>
                      )}
                    </p>
                  </div>
                </div>
                <a
                  href="/api/settings/oauth/facebook"
                  className="px-4 py-2 rounded-xl bg-blue-500 text-white text-xs font-bold hover:bg-blue-600 transition"
                >
                  {settings?.facebook_connected ? 'Reconnect' : 'Connect'}
                </a>
              </div>

              {/* Instagram */}
              <div className="flex items-center justify-between p-4 bg-black/5 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
                    <span className="text-pink-600 font-black text-xs">IG</span>
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${t.text}`}>Instagram Business</p>
                    <p className={`text-xs ${t.muted}`}>
                      {settings?.instagram_connected ? (
                        <span className="text-emerald-600 flex items-center gap-1"><Wifi className="w-3 h-3" /> Connected</span>
                      ) : (
                        <span className="text-slate-400 flex items-center gap-1"><WifiOff className="w-3 h-3" /> Connects via Facebook</span>
                      )}
                    </p>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-xl text-xs font-bold ${
                  settings?.instagram_connected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                }`}>
                  {settings?.instagram_connected ? 'Active' : 'Connect FB first'}
                </span>
              </div>

              {/* YouTube */}
              <div className="flex items-center justify-between p-4 bg-black/5 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                    <span className="text-red-600 font-black text-xs">YT</span>
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${t.text}`}>YouTube Channel</p>
                    <p className={`text-xs ${t.muted}`}>
                      {settings?.youtube_connected ? (
                        <span className="text-emerald-600 flex items-center gap-1"><Wifi className="w-3 h-3" /> Connected</span>
                      ) : (
                        <span className="text-slate-400 flex items-center gap-1"><WifiOff className="w-3 h-3" /> Not connected</span>
                      )}
                    </p>
                  </div>
                </div>
                <a
                  href="/api/settings/oauth/google"
                  className="px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition"
                >
                  {settings?.youtube_connected ? 'Reconnect' : 'Connect'}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Publishing Toggles */}
        <div className="xl:col-span-5 space-y-6">
          <div className={`${t.card} border ${t.border} rounded-[2.5rem] p-6 lg:p-8 shadow-sm backdrop-blur-md`}>
            <h3 className={`font-bold mb-2 ${t.text}`}>Publishing Rules</h3>
            <p className={`text-xs ${t.muted} mb-4`}>Control how Ahana&apos;s captures get published.</p>

            {settings && (
              <div className="divide-y divide-black/5">
                <ToggleButton
                  enabled={!!settings.require_review}
                  onToggle={() => toggle('require_review')}
                  label="Require parent review"
                />
                <ToggleButton
                  enabled={!!settings.facebook_enabled}
                  onToggle={() => toggle('facebook_enabled')}
                  label="Publish to Facebook"
                />
                <ToggleButton
                  enabled={!!settings.instagram_enabled}
                  onToggle={() => toggle('instagram_enabled')}
                  label="Publish to Instagram"
                />
                <ToggleButton
                  enabled={!!settings.youtube_enabled}
                  onToggle={() => toggle('youtube_enabled')}
                  label="Publish to YouTube"
                />
              </div>
            )}

            {!settings && (
              <p className={`text-sm ${t.muted} py-4`}>Loading settings...</p>
            )}
          </div>

          <div className={`p-8 rounded-[2.5rem] bg-gradient-to-br ${t.gradient} text-white shadow-2xl`}>
            <Settings className="w-8 h-8 mb-4 opacity-80" />
            <h4 className="font-bold text-lg mb-2">How it Works</h4>
            <p className="text-white/90 text-sm leading-relaxed font-medium">
              When Ahana captures content from her Hub, it goes to your review queue. Once you approve, it auto-publishes to your connected platforms.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
