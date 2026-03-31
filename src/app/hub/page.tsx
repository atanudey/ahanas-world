'use client';

import { useState, useCallback } from 'react';
import {
  Sparkles, Award, Rocket, Music, Palette,
  Sun, Mic, Camera, PenTool, Book,
  CheckCircle2, ChevronRight, LogOut,
  X, Wand2, Trophy, Gamepad2,
  Upload, Check, AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { ViewSwitcher } from '@/components/shared/ViewSwitcher';
import { GradientBlobs } from '@/components/shared/GradientBlobs';
import { MinecraftHub } from '@/components/minecraft/MinecraftHub';
import { AudioCapture } from '@/components/hub/AudioCapture';
import { VideoCapture } from '@/components/hub/VideoCapture';
import { DrawingCapture } from '@/components/hub/DrawingCapture';
import { ReadingCapture } from '@/components/hub/ReadingCapture';
import { useUploadContent } from '@/hooks/useUploadContent';
import type { CaptureResult } from '@/lib/types/capture';

type CaptureType = 'Sing' | 'Show' | 'Draw' | 'Read';

const CAPTURE_ACTIONS: { icon: typeof Mic; label: CaptureType; color: string; description: string }[] = [
  { icon: Mic, label: 'Sing', color: 'from-pink-500 to-rose-500', description: 'Record a voice memo or melody' },
  { icon: Camera, label: 'Show', color: 'from-violet-500 to-purple-500', description: 'Snap a photo of your creation' },
  { icon: PenTool, label: 'Draw', color: 'from-fuchsia-500 to-pink-500', description: 'Save a new sketch or painting' },
  { icon: Book, label: 'Read', color: 'from-rose-400 to-orange-400', description: 'Log a book or reading reflection' },
];

interface Mission {
  id: string;
  text: string;
  xp: number;
  done: boolean;
}

const INITIAL_MISSIONS: Mission[] = [
  { id: 'q1', text: 'Practice the Nebula melody', xp: 50, done: false },
  { id: 'q2', text: 'Pick one color for Mars', xp: 30, done: true },
  { id: 'q3', text: 'Read the Moon Story', xp: 20, done: false },
];

interface Badge {
  icon: typeof Award;
  name: string;
  description: string;
  unlocked: boolean;
  unlocksAt: number; // XP threshold
}

const INITIAL_BADGES: Badge[] = [
  { icon: Award, name: 'Star Creator', description: 'Complete your first quest', unlocked: true, unlocksAt: 0 },
  { icon: Rocket, name: 'Space Explorer', description: 'Earn 50 XP total', unlocked: true, unlocksAt: 50 },
  { icon: Music, name: 'Melody Maker', description: 'Capture 3 songs', unlocked: true, unlocksAt: 80 },
  { icon: Palette, name: 'Color Wizard', description: 'Capture 3 drawings', unlocked: true, unlocksAt: 100 },
  { icon: Trophy, name: 'Quest Champion', description: 'Complete all quests', unlocked: false, unlocksAt: 200 },
  { icon: Gamepad2, name: 'Challenge Master', description: 'Complete 5 space challenges', unlocked: false, unlocksAt: 300 },
];

const BASE_XP = 730; // XP already earned before current quests

function computeLevel(xp: number): number {
  // Every 100 XP = 1 level, starting at level 1
  return Math.floor(xp / 100) + 1;
}

export default function HubPage() {
  const { mode, theme: t } = useTheme();
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [badges, setBadges] = useState<Badge[]>(INITIAL_BADGES);
  const [captureModal, setCaptureModal] = useState<CaptureType | null>(null);
  const [captureSuccess, setCaptureSuccess] = useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [xpPopup, setXpPopup] = useState<{ xp: number; id: string } | null>(null);
  const { uploadState, upload, reset: resetUpload } = useUploadContent();

  const earnedXp = missions.filter((m) => m.done).reduce((sum, m) => sum + m.xp, 0);
  const totalXp = BASE_XP + earnedXp;
  const level = computeLevel(totalXp);

  const toggleMission = useCallback((id: string) => {
    setMissions((prev) => {
      const updated = prev.map((m) =>
        m.id === id ? { ...m, done: !m.done } : m,
      );
      const newEarned = updated.filter((m) => m.done).reduce((sum, m) => sum + m.xp, 0);
      const newTotal = BASE_XP + newEarned;

      // Check if any new badges should unlock
      setBadges((prevBadges) =>
        prevBadges.map((b) => ({
          ...b,
          unlocked: b.unlocked || newTotal >= b.unlocksAt,
        })),
      );

      // Show XP popup for the toggled quest
      const toggled = updated.find((m) => m.id === id);
      if (toggled?.done) {
        setXpPopup({ xp: toggled.xp, id });
        setTimeout(() => setXpPopup(null), 1500);
      }

      return updated;
    });
  }, []);

  const handleCapture = useCallback((type: CaptureType) => {
    resetUpload();
    setCaptureModal(type);
  }, [resetUpload]);

  const handleCaptureComplete = useCallback(async (
    result: CaptureResult | null,
    title: string,
    notes: string,
    type: 'song' | 'art' | 'video' | 'reading',
  ) => {
    setCaptureModal(null);
    const data = await upload({
      type,
      title,
      notes,
      mediaBlob: result?.blob,
      thumbnailBlob: result?.thumbnail,
      mimeType: result?.mimeType,
      duration: result?.duration,
    });
    if (data) {
      setCaptureSuccess(title);
      setTimeout(() => { setCaptureSuccess(null); resetUpload(); }, 3000);
    }
  }, [upload, resetUpload]);

  if (mode === 'minecraft') {
    return <MinecraftHub />;
  }

  return (
    <div
      className={`min-h-screen ${t.bg} ${t.text} transition-colors duration-700 relative flex flex-col`}
    >
      <div className="fixed inset-0 z-0 pointer-events-none">
        <GradientBlobs />
      </div>
      {/* Texture */}
      <div
        className={`fixed inset-0 z-0 pointer-events-none ${t.texture}`}
        style={{
          backgroundImage:
            "url('https://www.transparenttextures.com/patterns/handmade-paper.png')",
          opacity: 0.2,
        }}
      />

      {/* Success Toast */}
      {captureSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold text-sm flex items-center gap-2">
            <Check className="w-4 h-4" />
            &ldquo;{captureSuccess}&rdquo; captured! Sent for review.
          </div>
        </div>
      )}

      {/* Upload Progress Toast */}
      {uploadState.status === 'uploading' && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-violet-600 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold text-sm flex items-center gap-3">
            <Upload className="w-4 h-4 animate-pulse" />
            Uploading... {uploadState.progress}%
          </div>
        </div>
      )}

      {uploadState.status === 'error' && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-red-500 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {uploadState.error || 'Upload failed'}
          </div>
        </div>
      )}

      {/* Capture Modals — specialized per type */}
      {captureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-4">
          {captureModal === 'Sing' && (
            <AudioCapture
              onComplete={(result, title, notes) => handleCaptureComplete(result, title, notes, 'song')}
              onCancel={() => setCaptureModal(null)}
            />
          )}
          {captureModal === 'Show' && (
            <VideoCapture
              onComplete={(result, title, notes) => {
                const type = result.mimeType.startsWith('video/') ? 'video' : 'art';
                handleCaptureComplete(result, title, notes, type);
              }}
              onCancel={() => setCaptureModal(null)}
            />
          )}
          {captureModal === 'Draw' && (
            <DrawingCapture
              onComplete={(result, title, notes) => handleCaptureComplete(result, title, notes, 'art')}
              onCancel={() => setCaptureModal(null)}
            />
          )}
          {captureModal === 'Read' && (
            <ReadingCapture
              onComplete={(result, title, notes) => handleCaptureComplete(result, title, notes, 'reading')}
              onCancel={() => setCaptureModal(null)}
            />
          )}
        </div>
      )}

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setSelectedBadge(null)}>
          <div
            className="bg-white rounded-[2.5rem] p-8 shadow-2xl max-w-sm w-full mx-4 text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
            <div className={`w-20 h-20 mx-auto rounded-[1.5rem] flex items-center justify-center mb-4 ${
              selectedBadge.unlocked
                ? 'bg-teal-50 border-2 border-teal-200'
                : 'bg-slate-100 border-2 border-slate-200'
            }`}>
              <selectedBadge.icon className={`w-10 h-10 ${
                selectedBadge.unlocked ? 'text-teal-500' : 'text-slate-300'
              }`} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-1">{selectedBadge.name}</h3>
            <p className="text-slate-500 text-sm font-medium mb-3">{selectedBadge.description}</p>
            {selectedBadge.unlocked ? (
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                Unlocked!
              </span>
            ) : (
              <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">
                Unlocks at {selectedBadge.unlocksAt} XP
              </span>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="relative z-10 p-6 lg:p-10 flex justify-between items-center">
        <div className="flex items-center gap-4 lg:gap-6">
          <div
            className={`w-14 h-14 lg:w-16 lg:h-16 rounded-3xl bg-gradient-to-tr ${t.gradient} p-1 shadow-xl`}
          >
            <div
              className={`w-full h-full ${
                mode === 'moonlit' ? 'bg-indigo-950' : 'bg-white'
              } rounded-[1.4rem] flex items-center justify-center`}
            >
              <Sparkles className="w-7 h-7 lg:w-8 lg:h-8 text-teal-500" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-black italic tracking-tighter">
              AHANA&apos;S STUDIO
            </h1>
            <p
              className={`text-[10px] font-black uppercase tracking-widest ${t.muted}`}
            >
              Ready to create something magic?
            </p>
          </div>
        </div>

        <div className="flex gap-3 lg:gap-4">
          <div
            className={`${t.glass} px-4 lg:px-6 py-3 rounded-2xl flex items-center gap-3`}
          >
            <Award className="text-teal-500 w-5 h-5 lg:w-6 lg:h-6" />
            <div className="text-right">
              <p className="text-[10px] font-black opacity-60 uppercase tracking-widest leading-none">
                Level
              </p>
              <p className="text-lg lg:text-xl font-black text-teal-700">{level}</p>
            </div>
          </div>
          <div
            className={`${t.glass} px-4 lg:px-6 py-3 rounded-2xl flex items-center gap-3`}
          >
            <Sparkles className="text-violet-500 w-5 h-5 lg:w-6 lg:h-6" />
            <div className="text-right">
              <p className="text-[10px] font-black opacity-60 uppercase tracking-widest leading-none">
                XP
              </p>
              <p className="text-lg lg:text-xl font-black text-violet-600">{totalXp}</p>
            </div>
          </div>
          <Link
            href="/"
            className={`bg-white/80 border ${t.border} p-3 lg:p-4 rounded-2xl hover:bg-white transition backdrop-blur-xl shadow-sm flex items-center`}
          >
            <LogOut className={`w-5 h-5 lg:w-6 lg:h-6 ${t.muted}`} />
          </Link>
        </div>
      </header>

      {/* Main Grid */}
      <main className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 p-6 lg:p-10 pb-24 max-w-7xl mx-auto flex-1 content-start">
        {/* Capture Card */}
        <div className="lg:col-span-4 space-y-8">
          <div
            className={`bg-gradient-to-br ${t.gradient} p-8 lg:p-10 rounded-[3rem] text-white shadow-2xl relative group overflow-hidden`}
          >
            <Sun className="absolute -top-10 -right-10 w-48 h-48 opacity-20 pointer-events-none" />
            <h2 className="relative z-10 text-3xl lg:text-4xl font-black mb-2">Capture!</h2>
            <p className="relative z-10 text-white/90 text-sm mb-8 font-medium">
              Add a new sketch, song, or story.
            </p>
            <div className="relative z-10 grid grid-cols-2 gap-4">
              {CAPTURE_ACTIONS.map((act) => (
                <button
                  key={act.label}
                  onClick={() => handleCapture(act.label)}
                  className="bg-white/20 py-4 rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-white/30 transition active:scale-95 shadow-sm cursor-pointer touch-action-manipulation select-none"
                  style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                >
                  <act.icon className="w-6 h-6" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {act.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Creative Quest */}
        <div className="lg:col-span-5">
          <div
            className={`${t.glass} p-8 lg:p-10 rounded-[3.5rem] h-full flex flex-col`}
          >
            <h3 className={`text-2xl font-black italic mb-8 ${t.text}`}>
              Creative Quest
            </h3>
            <div className="space-y-4 flex-1">
              {missions.map((m) => (
                <div
                  key={m.id}
                  onClick={() => toggleMission(m.id)}
                  className={`p-5 rounded-2xl border ${
                    m.done
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                      : 'bg-slate-50 border-transparent text-slate-800'
                  } flex items-center justify-between group cursor-pointer hover:bg-white transition shadow-sm relative`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        m.done
                          ? 'bg-emerald-500 border-emerald-500 scale-110'
                          : 'border-teal-400 group-hover:border-teal-500'
                      } flex items-center justify-center`}
                    >
                      {m.done && (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className={`font-bold text-sm ${m.done ? 'line-through opacity-70' : ''}`}>
                      {m.text}
                    </span>
                  </div>
                  <span className={`text-[10px] font-black ${m.done ? 'text-emerald-500' : 'opacity-60'}`}>
                    +{m.xp} XP
                  </span>

                  {/* XP popup animation */}
                  {xpPopup?.id === m.id && (
                    <span className="absolute -top-3 right-4 text-sm font-black text-emerald-500 animate-bounce">
                      +{xpPopup.xp} XP!
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Space Challenge */}
            <div className="mt-8 p-6 bg-sky-50 rounded-3xl flex items-center gap-4 border border-sky-100 shadow-inner cursor-pointer hover:bg-sky-100 transition group">
              <div className="w-10 h-10 bg-sky-500/10 rounded-xl flex items-center justify-center text-sky-600 group-hover:scale-110 transition">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-sky-900">
                  Space Challenge
                </p>
                <p className="text-[10px] font-medium text-sky-700">
                  Why do the stars twinkle?
                </p>
              </div>
              <ChevronRight className="ml-auto text-sky-400 group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="lg:col-span-3 space-y-8">
          <div
            className={`${t.glass} p-8 rounded-[3rem]`}
          >
            <h3 className="text-[10px] font-black uppercase tracking-widest text-teal-600 mb-6">
              Badges Unlocked
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {badges.map((badge, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedBadge(badge)}
                  className={`aspect-square rounded-[1.5rem] flex items-center justify-center group cursor-pointer hover:scale-110 transition border relative ${
                    badge.unlocked
                      ? 'bg-teal-50 border-teal-100'
                      : 'bg-slate-100 border-slate-200 opacity-40'
                  }`}
                  title={badge.name}
                >
                  <badge.icon className={`w-10 h-10 transition-colors ${
                    badge.unlocked
                      ? 'text-teal-500 group-hover:text-emerald-500'
                      : 'text-slate-400'
                  }`} />
                  {!badge.unlocked && (
                    <div className="absolute inset-0 rounded-[1.5rem] flex items-center justify-center">
                      <div className="w-6 h-6 bg-slate-300 rounded-full flex items-center justify-center">
                        <span className="text-white text-[10px] font-black">?</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* XP Progress to next badge */}
            {(() => {
              const nextLocked = badges.find((b) => !b.unlocked);
              if (!nextLocked) return null;
              const progress = Math.min((totalXp / nextLocked.unlocksAt) * 100, 100);
              return (
                <div className="mt-6">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-teal-600 mb-2">
                    <span>Next: {nextLocked.name}</span>
                    <span>{totalXp}/{nextLocked.unlocksAt}</span>
                  </div>
                  <div className="w-full h-2 bg-teal-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </main>

      <ViewSwitcher />
    </div>
  );
}
