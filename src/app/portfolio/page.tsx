'use client';

import { useMemo, useState } from 'react';

/* ============================================================
   Portfolio Look-Through Dashboard
   Self-contained: data hardcoded below, no external fetching,
   no browser storage. Charts are hand-rolled with inline SVG +
   Tailwind to match the codebase conventions (no chart lib dep).
   ============================================================ */

type Bucket = 'Tech' | 'Financials' | 'Defensive' | 'Cyclical' | 'Other' | 'Debt/Cash';

interface Holding {
  account: string;
  name: string;
  category: string;
  current: number;
  invested: number;
  pnl: number;
  returnPct: number | null;
}

interface PortfolioData {
  meta: {
    owner: string;
    asOfDate: string;
    baseCurrency: string;
    usdToInr: number;
    methodology: string;
    caveats: string[];
  };
  summary: {
    investedINR: number;
    currentINR: number;
    pnlINR: number;
    returnPct: number;
    totalLookThroughINR: number;
    techExposureINR: number;
    techExposurePct: number;
  };
  byAccount: { account: string; currentINR: number; pct: number }[];
  byGeography: { region: string; currentINR: number; pct: number }[];
  byTheme: { theme: string; bucket: Bucket; currentINR: number; pct: number }[];
  holdings: Holding[];
}

const DATA: PortfolioData = {
  meta: {
    owner: 'Atanu Dey',
    asOfDate: '2026-06-18',
    baseCurrency: 'INR',
    usdToInr: 94.5,
    methodology:
      'Look-through: ETFs/index funds/flexi-cap funds decomposed into underlying sector weights (Nifty 50 ~Apr 2026, Nasdaq 100/Next-50 ~Mar 2026, PPFAS & HDFC Flexi Cap from factsheet estimates). Zerodha MF duplicates of Navi Nifty50 & PPFAS folio 13889665 excluded.',
    caveats: [
      'Active-fund sector splits are estimates, +/- 1-2 pts.',
      'NESTLEIND cost basis = 0 in source (corporate-action artifact); its P&L unreliable.',
      'US holdings converted at a single spot rate.',
    ],
  },
  summary: {
    investedINR: 5737762.94,
    currentINR: 6311721.86,
    pnlINR: 573958.92,
    returnPct: 10.0,
    totalLookThroughINR: 6330738.51,
    techExposureINR: 3103110.0,
    techExposurePct: 49.02,
  },
  byAccount: [
    { account: 'Zerodha Equity', currentINR: 4734055.17, pct: 74.78 },
    { account: 'Vested US', currentINR: 929114.55, pct: 14.68 },
    { account: 'Groww/External MF', currentINR: 648552.12, pct: 10.24 },
  ],
  byGeography: [
    { region: 'India', currentINR: 3984216.7, pct: 62.93 },
    { region: 'US', currentINR: 2310720.42, pct: 36.5 },
    { region: 'Debt/Cash', currentINR: 35801.39, pct: 0.57 },
  ],
  byTheme: [
    { theme: 'Financials', bucket: 'Financials', currentINR: 1205317.12, pct: 19.04 },
    { theme: 'India IT', bucket: 'Tech', currentINR: 792389.58, pct: 12.52 },
    { theme: 'Semiconductors', bucket: 'Tech', currentINR: 634168.49, pct: 10.02 },
    { theme: 'Healthcare', bucket: 'Defensive', currentINR: 630190.78, pct: 9.95 },
    { theme: 'US Internet/Comm', bucket: 'Tech', currentINR: 587576.33, pct: 9.28 },
    { theme: 'US Software/Cloud', bucket: 'Tech', currentINR: 495790.61, pct: 7.83 },
    { theme: 'US Consumer/Tech', bucket: 'Tech', currentINR: 446669.13, pct: 7.06 },
    { theme: 'Other India', bucket: 'Other', currentINR: 355580.7, pct: 5.62 },
    { theme: 'FMCG/Consumer', bucket: 'Defensive', currentINR: 289602.59, pct: 4.57 },
    { theme: 'Energy', bucket: 'Cyclical', currentINR: 285666.53, pct: 4.51 },
    { theme: 'US Other', bucket: 'Tech', currentINR: 146515.85, pct: 2.31 },
    { theme: 'Automobiles', bucket: 'Cyclical', currentINR: 139121.86, pct: 2.2 },
    { theme: 'Telecom', bucket: 'Other', currentINR: 100788.35, pct: 1.59 },
    { theme: 'Construction/Infra', bucket: 'Cyclical', currentINR: 95083.35, pct: 1.5 },
    { theme: 'Metals', bucket: 'Cyclical', currentINR: 66558.35, pct: 1.05 },
    { theme: 'Debt/Cash', bucket: 'Debt/Cash', currentINR: 35801.39, pct: 0.57 },
    { theme: 'Media/Discretionary', bucket: 'Cyclical', currentINR: 23917.5, pct: 0.38 },
  ],
  holdings: [
    { account: 'Zerodha', name: 'APOLLOHOSP', category: 'Healthcare', current: 168246.0, invested: 140830.0, pnl: 27416.0, returnPct: 19.47 },
    { account: 'Zerodha', name: 'ARMANFIN', category: 'Financials', current: 33922.0, invested: 36859.8, pnl: -2937.8, returnPct: -7.97 },
    { account: 'Zerodha', name: 'CAMS', category: 'Financials', current: 33312.0, invested: 35247.4, pnl: -1935.4, returnPct: -5.49 },
    { account: 'Zerodha', name: 'IDFCFIRSTB', category: 'Financials', current: 143685.6, invested: 136943.47, pnl: 6742.13, returnPct: 4.92 },
    { account: 'Zerodha', name: 'INFY', category: 'India IT', current: 279620.0, invested: 382636.6, pnl: -103016.6, returnPct: -26.92 },
    { account: 'Zerodha', name: 'JIOFIN', category: 'Financials', current: 226280.7, invested: 258057.52, pnl: -31776.82, returnPct: -12.31 },
    { account: 'Zerodha', name: 'KWIL', category: 'FMCG/Consumer', current: 2199.0, invested: 2776.27, pnl: -577.27, returnPct: -20.79 },
    { account: 'Zerodha', name: 'MAXHEALTH', category: 'Healthcare', current: 156013.0, invested: 148192.9, pnl: 7820.1, returnPct: 5.28 },
    { account: 'Zerodha', name: 'NESTLEIND', category: 'FMCG/Consumer', current: 58816.8, invested: 0.0, pnl: 58816.8, returnPct: null },
    { account: 'Zerodha', name: 'PVRINOX', category: 'Media/Discretionary', current: 23917.5, invested: 42984.7, pnl: -19067.2, returnPct: -44.36 },
    { account: 'Zerodha', name: 'RELIANCE', category: 'Energy', current: 47811.6, invested: 49878.0, pnl: -2066.4, returnPct: -4.14 },
    { account: 'Zerodha', name: 'TCS', category: 'India IT', current: 299784.8, invested: 413147.99, pnl: -113363.19, returnPct: -27.44 },
    { account: 'Zerodha', name: 'MON100-E (Nasdaq 100 ETF)', category: 'ETF', current: 1277276.0, invested: 829425.52, pnl: 447850.48, returnPct: 54.0 },
    { account: 'Zerodha', name: 'MONQ50 (Nasdaq Next-50 ETF)', category: 'ETF', current: 185653.0, invested: 109681.78, pnl: 75971.22, returnPct: 69.27 },
    { account: 'Zerodha', name: 'NIFTYBEES (Nifty 50 ETF)', category: 'ETF', current: 1797517.17, invested: 1848119.54, pnl: -50602.37, returnPct: -2.74 },
    { account: 'Groww/External MF', name: 'HDFC Flexi Cap (38417951)', category: 'Flexi Cap', current: 166699.53, invested: 169994.17, pnl: -3294.64, returnPct: -1.94 },
    { account: 'Groww/External MF', name: 'Mirae ELSS Tax Saver', category: 'ELSS', current: 1472.06, invested: 1054.65, pnl: 417.41, returnPct: 39.58 },
    { account: 'Groww/External MF', name: 'HDFC Flexi Cap (26843285)', category: 'Flexi Cap', current: 26283.18, invested: 19999.17, pnl: 6284.01, returnPct: 31.42 },
    { account: 'Groww/External MF', name: 'ICICI Prudential FMCG', category: 'Sector-FMCG', current: 87810.63, invested: 99996.09, pnl: -12185.46, returnPct: -12.19 },
    { account: 'Groww/External MF', name: 'Navi Nifty 50 Index', category: 'Index-Nifty50', current: 104149.84, invested: 99995.0, pnl: 4154.84, returnPct: 4.16 },
    { account: 'Groww/External MF', name: 'Parag Parikh Flexi Cap (13889665)', category: 'Flexi-PPFAS', current: 55430.39, invested: 39997.98, pnl: 15432.41, returnPct: 38.58 },
    { account: 'Groww/External MF', name: 'HDFC Hybrid Debt', category: 'Hybrid-Debt', current: 10013.33, invested: 9999.5, pnl: 13.83, returnPct: 0.14 },
    { account: 'Groww/External MF', name: 'Parag Parikh Flexi Cap (10621178)', category: 'Flexi-PPFAS', current: 130992.19, invested: 129993.35, pnl: 998.84, returnPct: 0.77 },
    { account: 'Groww/External MF', name: 'Mirae Healthcare', category: 'Sector-Healthcare', current: 65700.97, invested: 59997.0, pnl: 5703.97, returnPct: 9.51 },
    { account: 'Vested US', name: 'ADBE', category: 'US Software/Cloud', current: 18620.28, invested: 41096.16, pnl: -22475.88, returnPct: -54.69 },
    { account: 'Vested US', name: 'AMD', category: 'Semiconductors', current: 52661.07, invested: 25672.82, pnl: 26988.25, returnPct: 105.12 },
    { account: 'Vested US', name: 'AMZN', category: 'US Consumer/Tech', current: 153568.17, invested: 132405.84, pnl: 21162.33, returnPct: 15.98 },
    { account: 'Vested US', name: 'GOOGL', category: 'US Internet/Comm', current: 179456.45, invested: 97017.48, pnl: 82438.97, returnPct: 84.97 },
    { account: 'Vested US', name: 'HCA', category: 'Healthcare', current: 17874.67, invested: 20548.08, pnl: -2673.41, returnPct: -13.01 },
    { account: 'Vested US', name: 'META', category: 'US Internet/Comm', current: 148141.04, invested: 166577.04, pnl: -18436.0, returnPct: -11.07 },
    { account: 'Vested US', name: 'MSFT', category: 'US Software/Cloud', current: 45686.97, invested: 43995.42, pnl: 1691.55, returnPct: 3.84 },
    { account: 'Vested US', name: 'NFLX', category: 'US Internet/Comm', current: 14678.69, invested: 15699.28, pnl: -1020.59, returnPct: -6.5 },
    { account: 'Vested US', name: 'NVDA', category: 'Semiconductors', current: 56402.33, invested: 44945.15, pnl: 11457.18, returnPct: 25.49 },
    { account: 'Vested US', name: 'SOXX', category: 'Semiconductors', current: 242024.9, invested: 83997.27, pnl: 158027.63, returnPct: 188.13 },
  ],
};

/* ---------- Formatting helpers (Indian lakh/crore notation) ---------- */

function formatINR(value: number): string {
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  if (abs >= 1e7) return `${sign}₹${(abs / 1e7).toFixed(2)}Cr`;
  return `${sign}₹${(abs / 1e5).toFixed(1)}L`;
}

function formatINRFull(value: number): string {
  return `${value < 0 ? '-' : ''}₹${Math.abs(value).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })}`;
}

/* ---------- Palette ---------- */

const BUCKET_COLORS: Record<Bucket, string> = {
  Tech: '#3b82f6', // blue
  Financials: '#6366f1', // indigo
  Defensive: '#22c55e', // green
  Cyclical: '#f59e0b', // amber
  Other: '#64748b', // slate
  'Debt/Cash': '#9ca3af', // gray
};

const BUCKET_ORDER: Bucket[] = ['Tech', 'Financials', 'Defensive', 'Cyclical', 'Other', 'Debt/Cash'];

const GEO_COLORS: Record<string, string> = {
  India: '#1e3a8a', // navy
  US: '#0ea5e9', // sky
  'Debt/Cash': '#9ca3af', // gray
};

const ACCOUNT_COLORS = ['#1e3a8a', '#0ea5e9', '#14b8a6'];

/* ---------- Donut chart (inline SVG) ---------- */

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function donutSlice(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  startAngle: number,
  endAngle: number,
) {
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  const p1 = polar(cx, cy, rOuter, endAngle);
  const p2 = polar(cx, cy, rOuter, startAngle);
  const p3 = polar(cx, cy, rInner, startAngle);
  const p4 = polar(cx, cy, rInner, endAngle);
  return [
    `M ${p1.x} ${p1.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 0 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 1 ${p4.x} ${p4.y}`,
    'Z',
  ].join(' ');
}

interface DonutDatum {
  label: string;
  value: number;
  pct: number;
  color: string;
}

function Donut({ data, centerLabel, centerValue }: { data: DonutDatum[]; centerLabel: string; centerValue: string }) {
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = 90;
  const rInner = 58;
  const total = data.reduce((s, d) => s + d.pct, 0) || 100;

  // Precompute each slice's start/end angle immutably (no render-time mutation).
  const slices = data.reduce<{ d: DonutDatum; start: number; end: number }[]>((acc, d) => {
    const start = acc.length ? acc[acc.length - 1].end : 0;
    const end = start + (d.pct / total) * 360;
    acc.push({ d, start, end });
    return acc;
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-center sm:gap-6">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-44 h-44 shrink-0" role="img" aria-label={`${centerLabel} breakdown`}>
        {slices.map(({ d, start, end }) => {
          const mid = (start + end) / 2;
          const labelPos = polar(cx, cy, (rOuter + rInner) / 2, mid);
          return (
            <g key={d.label}>
              <path d={donutSlice(cx, cy, rOuter, rInner, start, end)} fill={d.color} stroke="#fff" strokeWidth={2} />
              {d.pct >= 6 && (
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-white"
                  style={{ fontSize: 12, fontWeight: 700 }}
                >
                  {d.pct.toFixed(0)}%
                </text>
              )}
            </g>
          );
        })}
        <text x={cx} y={cy - 6} textAnchor="middle" className="fill-slate-400" style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>
          {centerLabel.toUpperCase()}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" className="fill-slate-800" style={{ fontSize: 16, fontWeight: 800 }}>
          {centerValue}
        </text>
      </svg>
      <ul className="space-y-2 w-full sm:w-auto">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2 text-sm">
            <span className="inline-block w-3 h-3 rounded-sm shrink-0" style={{ background: d.color }} />
            <span className="font-medium text-slate-700">{d.label}</span>
            <span className="ml-auto sm:ml-3 tabular-nums font-semibold text-slate-900">{d.pct.toFixed(1)}%</span>
            <span className="tabular-nums text-slate-400 text-xs w-16 text-right">{formatINR(d.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- KPI card ---------- */

function KpiCard({
  label,
  value,
  sub,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: 'neutral' | 'positive' | 'negative' | 'warning';
}) {
  const toneClasses: Record<string, string> = {
    neutral: 'text-slate-900',
    positive: 'text-emerald-600',
    negative: 'text-red-600',
    warning: 'text-amber-600',
  };
  const ring: Record<string, string> = {
    neutral: 'ring-slate-100',
    positive: 'ring-emerald-100',
    negative: 'ring-red-100',
    warning: 'ring-amber-100',
  };
  return (
    <div className={`bg-white rounded-xl shadow-sm ring-1 ${ring[tone]} p-5 flex flex-col gap-1`}>
      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
      <span className={`text-2xl font-black tracking-tight ${toneClasses[tone]}`}>{value}</span>
      {sub && <span className={`text-xs font-semibold ${toneClasses[tone]}`}>{sub}</span>}
    </div>
  );
}

/* ---------- Theme distribution (horizontal bars + toggle) ---------- */

type ThemeMode = 'theme' | 'bucket';

function ThemeDistribution() {
  const [mode, setMode] = useState<ThemeMode>('theme');

  const rows = useMemo(() => {
    if (mode === 'theme') {
      return [...DATA.byTheme]
        .sort((a, b) => b.pct - a.pct)
        .map((t) => ({ label: t.theme, bucket: t.bucket, pct: t.pct, value: t.currentINR }));
    }
    const agg = new Map<Bucket, { pct: number; value: number }>();
    for (const t of DATA.byTheme) {
      const e = agg.get(t.bucket) ?? { pct: 0, value: 0 };
      e.pct += t.pct;
      e.value += t.currentINR;
      agg.set(t.bucket, e);
    }
    return BUCKET_ORDER.filter((b) => agg.has(b))
      .map((b) => ({ label: b, bucket: b, pct: agg.get(b)!.pct, value: agg.get(b)!.value }))
      .sort((a, b) => b.pct - a.pct);
  }, [mode]);

  const max = Math.max(...rows.map((r) => r.pct));

  return (
    <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-100 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="text-base font-black text-slate-800">Theme Distribution</h2>
        <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-bold">
          {(['theme', 'bucket'] as ThemeMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded-md transition ${
                mode === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {m === 'theme' ? 'By theme' : 'By bucket'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-3">
            <span className="w-32 sm:w-40 shrink-0 text-xs font-semibold text-slate-600 truncate" title={r.label}>
              {r.label}
            </span>
            <div className="flex-1 h-6 bg-slate-50 rounded-md overflow-hidden">
              <div
                className="h-full rounded-md flex items-center justify-end pr-2 transition-all duration-500"
                style={{ width: `${(r.pct / max) * 100}%`, background: BUCKET_COLORS[r.bucket], minWidth: 2 }}
              >
                <span className="text-[10px] font-bold text-white/95 tabular-nums">{r.pct.toFixed(1)}%</span>
              </div>
            </div>
            <span className="w-16 shrink-0 text-right text-xs tabular-nums text-slate-400">{formatINR(r.value)}</span>
          </div>
        ))}
      </div>

      {/* Bucket legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-5 pt-4 border-t border-slate-100">
        {BUCKET_ORDER.map((b) => (
          <span key={b} className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: BUCKET_COLORS[b] }} />
            {b}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Holdings table ---------- */

type SortKey = 'account' | 'name' | 'category' | 'current' | 'invested' | 'pnl' | 'returnPct';
type SortDir = 'asc' | 'desc';

const ACCOUNT_FILTERS = ['All', 'Zerodha', 'Vested US', 'Groww/External MF'];

function HoldingsTable() {
  const [sortKey, setSortKey] = useState<SortKey>('current');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [filter, setFilter] = useState('All');

  const rows = useMemo(() => {
    const filtered = DATA.holdings.filter((h) => filter === 'All' || h.account === filter);
    const sorted = [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === null) return 1;
      if (bv === null) return -1;
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return sorted;
  }, [sortKey, sortDir, filter]);

  const totals = useMemo(() => {
    const current = rows.reduce((s, h) => s + h.current, 0);
    const invested = rows.reduce((s, h) => s + h.invested, 0);
    const pnl = rows.reduce((s, h) => s + h.pnl, 0);
    return { current, invested, pnl, returnPct: invested > 0 ? (pnl / invested) * 100 : 0 };
  }, [rows]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'name' || key === 'account' || key === 'category' ? 'asc' : 'desc');
    }
  }

  const cols: { key: SortKey; label: string; align: 'left' | 'right' }[] = [
    { key: 'account', label: 'Account', align: 'left' },
    { key: 'name', label: 'Holding', align: 'left' },
    { key: 'category', label: 'Category', align: 'left' },
    { key: 'current', label: 'Current', align: 'right' },
    { key: 'invested', label: 'Invested', align: 'right' },
    { key: 'pnl', label: 'P&L', align: 'right' },
    { key: 'returnPct', label: 'Return %', align: 'right' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-100 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-base font-black text-slate-800">Holdings</h2>
        <div className="flex flex-wrap gap-1.5">
          {ACCOUNT_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                filter === f ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto -mx-2 sm:mx-0">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200">
              {cols.map((c) => (
                <th
                  key={c.key}
                  onClick={() => toggleSort(c.key)}
                  className={`py-2.5 px-2 font-bold text-[11px] uppercase tracking-wider text-slate-500 cursor-pointer select-none hover:text-slate-800 whitespace-nowrap ${
                    c.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {c.label}
                  {sortKey === c.key && <span className="ml-1 text-slate-400">{sortDir === 'asc' ? '▲' : '▼'}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((h, i) => (
              <tr key={`${h.account}-${h.name}`} className={`border-b border-slate-50 ${i % 2 ? 'bg-slate-50/40' : ''}`}>
                <td className="py-2 px-2 text-slate-500 text-xs whitespace-nowrap">{h.account}</td>
                <td className="py-2 px-2 font-semibold text-slate-800">{h.name}</td>
                <td className="py-2 px-2 text-slate-500 text-xs whitespace-nowrap">{h.category}</td>
                <td className="py-2 px-2 text-right tabular-nums text-slate-800">{formatINRFull(h.current)}</td>
                <td className="py-2 px-2 text-right tabular-nums text-slate-500">{formatINRFull(h.invested)}</td>
                <td className={`py-2 px-2 text-right tabular-nums font-semibold ${h.pnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatINRFull(h.pnl)}
                </td>
                <td className="py-2 px-2 text-right tabular-nums font-semibold">
                  {h.returnPct === null ? (
                    <span className="text-slate-400" title="Cost basis = 0 (corporate-action artifact)">n/a</span>
                  ) : (
                    <span className={h.returnPct >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                      {h.returnPct >= 0 ? '+' : ''}
                      {h.returnPct.toFixed(2)}%
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-200 font-bold">
              <td className="py-2.5 px-2 text-slate-700 text-xs" colSpan={3}>
                Total ({rows.length})
              </td>
              <td className="py-2.5 px-2 text-right tabular-nums text-slate-900">{formatINRFull(totals.current)}</td>
              <td className="py-2.5 px-2 text-right tabular-nums text-slate-600">{formatINRFull(totals.invested)}</td>
              <td className={`py-2.5 px-2 text-right tabular-nums ${totals.pnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatINRFull(totals.pnl)}
              </td>
              <td className={`py-2.5 px-2 text-right tabular-nums ${totals.returnPct >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {totals.returnPct >= 0 ? '+' : ''}
                {totals.returnPct.toFixed(2)}%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

/* ---------- Insights ---------- */

const INSIGHTS: { title: string; body: string; tone: 'blue' | 'sky' | 'amber' | 'red' | 'slate' }[] = [
  {
    title: 'Tech + Financials barbell',
    body: 'Broad tech is ~49% and Financials ~19% — roughly two-thirds of the book riding on just two macro stories.',
    tone: 'blue',
  },
  {
    title: 'True US exposure ~36.5%',
    body: 'On look-through, the Nasdaq ETFs sit inside the Indian (Zerodha) account and PPFAS holds US megacaps directly — a strong USD tilt beyond the Vested account.',
    tone: 'sky',
  },
  {
    title: 'Semiconductors ~₹6.3L (~10%)',
    body: 'The most cyclical theme, built via SOXX / NVDA / AMD plus the Nasdaq-100 slice. High beta to the chip cycle.',
    tone: 'amber',
  },
  {
    title: 'India IT ~12.6% is the pain point',
    body: 'TCS & INFY are both ~-27% on an AI de-rating, and this doubles up with US software risk (ADBE, MSFT).',
    tone: 'red',
  },
  {
    title: 'Almost no defensive ballast',
    body: 'Debt/Cash is ~0.6% — this is essentially an all-equity growth book with little downside cushion.',
    tone: 'slate',
  },
  {
    title: 'NESTLEIND P&L is unreliable',
    body: 'Cost basis = 0 in the source data (a corporate-action artifact), so its reported P&L and return are not meaningful.',
    tone: 'slate',
  },
];

function InsightCard({ insight }: { insight: (typeof INSIGHTS)[number] }) {
  const toneMap: Record<string, string> = {
    blue: 'border-blue-200 bg-blue-50/50',
    sky: 'border-sky-200 bg-sky-50/50',
    amber: 'border-amber-200 bg-amber-50/50',
    red: 'border-red-200 bg-red-50/50',
    slate: 'border-slate-200 bg-slate-50/50',
  };
  const dotMap: Record<string, string> = {
    blue: 'bg-blue-500',
    sky: 'bg-sky-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    slate: 'bg-slate-400',
  };
  return (
    <div className={`rounded-xl border ${toneMap[insight.tone]} p-4`}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`w-2 h-2 rounded-full ${dotMap[insight.tone]}`} />
        <h3 className="text-sm font-black text-slate-800">{insight.title}</h3>
      </div>
      <p className="text-xs leading-relaxed text-slate-600">{insight.body}</p>
    </div>
  );
}

/* ---------- Page ---------- */

export default function PortfolioPage() {
  const { meta, summary, byGeography, byAccount, holdings } = DATA;

  const geoData: DonutDatum[] = byGeography.map((g) => ({
    label: g.region,
    value: g.currentINR,
    pct: g.pct,
    color: GEO_COLORS[g.region] ?? '#94a3b8',
  }));

  const accountData: DonutDatum[] = byAccount.map((a, i) => ({
    label: a.account,
    value: a.currentINR,
    pct: a.pct,
    color: ACCOUNT_COLORS[i % ACCOUNT_COLORS.length],
  }));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
        {/* Header */}
        <header className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-lg shadow-md">
              ₹
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Portfolio Dashboard</h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {meta.owner} · as of {meta.asOfDate} · Look-through analysis · US @ ₹{meta.usdToInr}/USD
              </p>
            </div>
          </div>
        </header>

        {/* KPI row */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KpiCard label="Current Value" value={formatINR(summary.currentINR)} sub={`Invested ${formatINR(summary.investedINR)}`} />
          <KpiCard
            label="Total P&L"
            value={`${summary.pnlINR >= 0 ? '+' : ''}${formatINR(summary.pnlINR)}`}
            sub={`${summary.returnPct >= 0 ? '+' : ''}${summary.returnPct.toFixed(1)}% return`}
            tone={summary.pnlINR >= 0 ? 'positive' : 'negative'}
          />
          <KpiCard
            label="Tech Exposure"
            value={`${summary.techExposurePct.toFixed(1)}%`}
            sub={`${formatINR(summary.techExposureINR)} · ~half the book`}
            tone="warning"
          />
          <KpiCard label="Holdings" value={String(holdings.length)} sub="positions across 3 accounts" />
        </section>

        {/* Donuts row */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-100 p-5 sm:p-6">
            <h2 className="text-base font-black text-slate-800 mb-4">By Geography</h2>
            <Donut data={geoData} centerLabel="Total" centerValue={formatINR(summary.currentINR)} />
          </div>
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-100 p-5 sm:p-6">
            <h2 className="text-base font-black text-slate-800 mb-4">By Account</h2>
            <Donut data={accountData} centerLabel="Accounts" centerValue={String(byAccount.length)} />
          </div>
        </section>

        {/* Theme distribution */}
        <ThemeDistribution />

        {/* Holdings + insights */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          <div className="xl:col-span-2">
            <HoldingsTable />
          </div>
          <div className="space-y-3">
            <h2 className="text-base font-black text-slate-800 px-1">Insights</h2>
            {INSIGHTS.map((ins) => (
              <InsightCard key={ins.title} insight={ins} />
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-4 border-t border-slate-200 space-y-2 text-[11px] leading-relaxed text-slate-400">
          <p>
            <span className="font-bold text-slate-500">Methodology — </span>
            {meta.methodology}
          </p>
          <div>
            <span className="font-bold text-slate-500">Caveats:</span>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              {meta.caveats.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </footer>
      </div>
    </div>
  );
}
