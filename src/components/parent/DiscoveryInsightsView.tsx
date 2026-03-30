'use client';

import { Eye, Heart, Star, Users, TrendingUp, BarChart3 } from 'lucide-react';
import type { Theme } from '@/lib/theme';
import { MOCK_CONTENT } from '@/lib/constants';

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

export function DiscoveryInsightsView({ t }: { t: Theme }) {
  const maxBar = Math.max(...INSIGHTS_DATA.weeklyBreakdown.map((d) => d.value));

  return (
    <>
      <header className="mb-12">
        <h2 className="text-4xl font-black italic mb-2 tracking-tight">Discovery Insights</h2>
        <p className={`${t.muted} font-medium`}>How Ahana&apos;s creative world is growing.</p>
      </header>

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
          <p className={`text-xs font-bold ${t.muted} mt-1`}>{INSIGHTS_DATA.topContentViews.toLocaleString()} views</p>
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
