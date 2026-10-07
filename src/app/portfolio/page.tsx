import type { Metadata } from 'next';
import { PortfolioDashboard, type PortfolioData } from '@/components/portfolio/PortfolioDashboard';

export const metadata: Metadata = {
  title: 'Portfolio Dashboard',
  description: 'Personal portfolio look-through — parent access only.',
  robots: { index: false, follow: false },
};

/*
 * The data stays in this Server Component on purpose: the route is behind the
 * parent session (see proxy.ts), and a Server Component's props travel in that
 * protected response rather than in a public static JS chunk.
 */
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

export default function PortfolioPage() {
  return <PortfolioDashboard data={DATA} />;
}
