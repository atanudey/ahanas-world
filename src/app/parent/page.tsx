'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ShieldCheck, Clock, Settings, LogOut,
  Calendar, FileText, Archive, BarChart3,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { ViewSwitcher } from '@/components/shared/ViewSwitcher';
import { GradientBlobs } from '@/components/shared/GradientBlobs';
import { MinecraftParent } from '@/components/minecraft/MinecraftParent';
import { MOCK_CONTENT } from '@/lib/constants';
import { ContentDetailPanel } from '@/components/parent/ContentDetailPanel';
import { CreativePulseView } from '@/components/parent/CreativePulseView';
import { ReleaseCalendarView } from '@/components/parent/ReleaseCalendarView';
import { StudioNotesView } from '@/components/parent/StudioNotesView';
import { ArchiveRoomView } from '@/components/parent/ArchiveRoomView';
import { DiscoveryInsightsView } from '@/components/parent/DiscoveryInsightsView';
import { PublishSettingsView } from '@/components/parent/PublishSettingsView';

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
      // API might not be available — fall back silently
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

  const allContent = dbContent.length > 0 ? dbContent : MOCK_CONTENT;

  if (mode === 'minecraft') {
    return <MinecraftParent />;
  }

  return (
    <div className={`min-h-screen ${t.bg} ${t.text} flex transition-all duration-500 relative overflow-hidden`}>
      <GradientBlobs />

      {/* Sidebar */}
      <aside className={`w-72 border-r ${t.border} ${t.glass} p-8 flex flex-col hidden lg:flex relative z-10`}>
        <div className="flex items-center gap-4 mb-12">
          <div className={`w-10 h-10 bg-gradient-to-tr ${t.gradient} rounded-xl flex items-center justify-center text-white`}>
            <ShieldCheck className="w-6 h-6" />
          </div>
          <p className="font-black text-sm uppercase tracking-tighter">Studio Ledger</p>
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
          <Link href="/" className={`flex items-center gap-3 ${t.muted} font-bold text-xs uppercase tracking-widest`}>
            <LogOut className="w-4 h-4" /> Exit Ledger
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto relative">
        {activeSection === 'Creative Pulse' && (
          <CreativePulseView t={t} allContent={allContent} loading={loadingContent} onOpenDetail={openContentDetail} onRefresh={fetchContent} />
        )}
        {activeSection === 'Release Calendar' && <ReleaseCalendarView t={t} />}
        {activeSection === 'Studio Notes' && <StudioNotesView t={t} />}
        {activeSection === 'Archive Room' && <ArchiveRoomView t={t} allContent={allContent} onOpenDetail={openContentDetail} />}
        {activeSection === 'Discovery Insights' && <DiscoveryInsightsView t={t} />}
        {activeSection === 'Publish Settings' && <PublishSettingsView t={t} />}
      </main>

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
