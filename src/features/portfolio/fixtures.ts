import type {
  AllocationSlice,
  FolioDetail,
  FolioRecentTxn,
  FolioSummary,
  Holding,
  PerformancePoint,
  PortfolioOverview,
  PortfolioSummary,
  SectorAllocation,
} from "@/types/portfolio";

const HOLDINGS: Holding[] = [
  {
    id: "h_pp_flexi",
    schemeCode: "PP_FLEXI_G",
    schemeName: "Parag Parikh Flexi Cap — Direct Growth",
    amc: "PPFAS",
    category: "Flexi Cap",
    assetClass: "equity",
    units: 2841.7,
    avgNav: 412.32,
    currentNav: 527.91,
    invested: 1_171_500,
    currentValue: 1_500_140,
    unrealizedGain: 328_640,
    returnPct: 28.05,
    xirr: 22.4,
    sip: true,
    navAsOf: "2026-04-16",
  },
  {
    id: "h_axis_blue",
    schemeCode: "AXIS_BLUE_G",
    schemeName: "Axis Bluechip — Direct Growth",
    amc: "Axis MF",
    category: "Large Cap",
    assetClass: "equity",
    units: 9120.4,
    avgNav: 48.21,
    currentNav: 62.87,
    invested: 439_500,
    currentValue: 573_300,
    unrealizedGain: 133_800,
    returnPct: 30.45,
    xirr: 18.9,
    sip: true,
    navAsOf: "2026-04-16",
  },
  {
    id: "h_mirae_mid",
    schemeCode: "MIRAE_MID_G",
    schemeName: "Mirae Asset Midcap — Direct Growth",
    amc: "Mirae Asset",
    category: "Mid Cap",
    assetClass: "equity",
    units: 4280.1,
    avgNav: 24.78,
    currentNav: 32.12,
    invested: 106_000,
    currentValue: 137_480,
    unrealizedGain: 31_480,
    returnPct: 29.7,
    xirr: 24.6,
    sip: false,
    navAsOf: "2026-04-16",
  },
  {
    id: "h_quant_small",
    schemeCode: "QUANT_SMALL_G",
    schemeName: "Quant Small Cap — Direct Growth",
    amc: "Quant MF",
    category: "Small Cap",
    assetClass: "equity",
    units: 612.3,
    avgNav: 156.4,
    currentNav: 218.92,
    invested: 95_750,
    currentValue: 134_071,
    unrealizedGain: 38_321,
    returnPct: 40.02,
    xirr: 31.2,
    sip: true,
    navAsOf: "2026-04-16",
  },
  {
    id: "h_icici_corp",
    schemeCode: "ICICI_CORP_G",
    schemeName: "ICICI Pru Corporate Bond — Direct Growth",
    amc: "ICICI Pru",
    category: "Corporate Bond",
    assetClass: "debt",
    units: 18_420,
    avgNav: 26.4,
    currentNav: 28.21,
    invested: 486_300,
    currentValue: 519_628,
    unrealizedGain: 33_328,
    returnPct: 6.85,
    xirr: 7.2,
    sip: false,
    navAsOf: "2026-04-16",
  },
  {
    id: "h_hdfc_short",
    schemeCode: "HDFC_SHORT_G",
    schemeName: "HDFC Short Term Debt — Direct Growth",
    amc: "HDFC MF",
    category: "Short Duration",
    assetClass: "debt",
    units: 9821,
    avgNav: 28.1,
    currentNav: 29.74,
    invested: 275_950,
    currentValue: 292_077,
    unrealizedGain: 16_127,
    returnPct: 5.84,
    xirr: 6.4,
    sip: false,
    navAsOf: "2026-04-16",
  },
  {
    id: "h_nippon_gold",
    schemeCode: "NIPPON_GOLD_G",
    schemeName: "Nippon India Gold Savings — Direct Growth",
    amc: "Nippon",
    category: "Gold ETF",
    assetClass: "gold",
    units: 7521,
    avgNav: 18.2,
    currentNav: 24.51,
    invested: 136_900,
    currentValue: 184_339,
    unrealizedGain: 47_439,
    returnPct: 34.65,
    xirr: 21.3,
    sip: false,
    navAsOf: "2026-04-16",
  },
  {
    id: "h_motilal_nasdaq",
    schemeCode: "MOSL_NASDAQ_G",
    schemeName: "Motilal Oswal Nasdaq 100 FOF — Direct Growth",
    amc: "Motilal Oswal",
    category: "International",
    assetClass: "international",
    units: 5201,
    avgNav: 22.1,
    currentNav: 31.07,
    invested: 114_950,
    currentValue: 161_595,
    unrealizedGain: 46_645,
    returnPct: 40.58,
    xirr: 26.7,
    sip: true,
    navAsOf: "2026-04-16",
  },
];

function sumBy<T>(items: T[], pick: (it: T) => number): number {
  return items.reduce((acc, it) => acc + pick(it), 0);
}

function buildAllocation(by: "assetClass" | "category"): AllocationSlice[] {
  const total = sumBy(HOLDINGS, (h) => h.currentValue);
  const map = new Map<string, { label: string; value: number }>();
  for (const h of HOLDINGS) {
    const k = h[by];
    const label = by === "assetClass" ? capitalize(h.assetClass) : h.category;
    const prev = map.get(k);
    map.set(k, { label, value: (prev?.value ?? 0) + h.currentValue });
  }
  return Array.from(map.entries())
    .map(([key, v]) => ({ key, label: v.label, value: v.value, percent: (v.value / total) * 100 }))
    .sort((a, b) => b.value - a.value);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const SECTORS: SectorAllocation[] = [
  { sector: "Financial Services", weight: 24.6 },
  { sector: "Technology", weight: 18.2 },
  { sector: "Consumer", weight: 13.9 },
  { sector: "Healthcare", weight: 9.4 },
  { sector: "Energy", weight: 8.1 },
  { sector: "Industrials", weight: 7.7 },
  { sector: "Materials", weight: 6.2 },
  { sector: "Utilities", weight: 4.5 },
  { sector: "Others", weight: 7.4 },
];

function buildPerformance(): PerformancePoint[] {
  // 12 monthly points trending upward with realistic dispersion
  const start = new Date("2025-05-01").getTime();
  const months = 12;
  const points: PerformancePoint[] = [];
  let invested = 4_200_000;
  let value = 4_350_000;
  for (let i = 0; i <= months; i++) {
    const monthlyContribution = 80_000 + (i % 3 === 0 ? 25_000 : 0);
    invested += i === 0 ? 0 : monthlyContribution;
    // organic growth ~ 1.5% with sinusoidal volatility
    const drift = 1 + 0.014 + 0.022 * Math.sin(i / 1.6);
    value = value * drift + (i === 0 ? 0 : monthlyContribution);
    const date = new Date(start);
    date.setMonth(date.getMonth() + i);
    points.push({
      date: date.toISOString(),
      invested: Math.round(invested),
      value: Math.round(value),
    });
  }
  return points;
}

function buildSummary(): PortfolioSummary {
  const invested = sumBy(HOLDINGS, (h) => h.invested);
  const currentValue = sumBy(HOLDINGS, (h) => h.currentValue);
  const unrealizedGain = currentValue - invested;
  return {
    netWorth: currentValue,
    invested,
    currentValue,
    unrealizedGain,
    absoluteReturnPct: (unrealizedGain / invested) * 100,
    xirr: 19.4,
    todayChange: 12_840,
    todayChangePct: 0.36,
    monthlySip: 45_000,
    asOf: "2026-04-16T16:30:00.000Z",
  };
}

export const PORTFOLIO_FIXTURE: PortfolioOverview = {
  summary: buildSummary(),
  byAssetClass: buildAllocation("assetClass"),
  byCategory: buildAllocation("category"),
  bySector: SECTORS,
  performance: buildPerformance(),
  topHoldings: [...HOLDINGS].sort((a, b) => b.currentValue - a.currentValue).slice(0, 5),
};

export const HOLDINGS_FIXTURE: Holding[] = HOLDINGS;

/* ─── Folio synthesis (groups holdings by AMC) ───────────────────── */

const AMC_TO_FOLIO: Record<string, { folio: string; registrar: "CAMS" | "KFintech"; openedOn: string }> = {
  PPFAS: { folio: "PP-91823412", registrar: "CAMS", openedOn: "2023-04-12" },
  "Axis MF": { folio: "AX-77124908", registrar: "KFintech", openedOn: "2023-09-02" },
  "Mirae Asset": { folio: "MR-44128820", registrar: "CAMS", openedOn: "2024-02-18" },
  "Quant MF": { folio: "QT-30219844", registrar: "KFintech", openedOn: "2024-08-30" },
  "ICICI Pru": { folio: "IC-99008712", registrar: "CAMS", openedOn: "2022-11-10" },
  "HDFC MF": { folio: "HD-66432110", registrar: "CAMS", openedOn: "2023-01-22" },
  Nippon: { folio: "NP-22788001", registrar: "KFintech", openedOn: "2024-07-04" },
  "Motilal Oswal": { folio: "MO-50912387", registrar: "KFintech", openedOn: "2024-04-15" },
};

const SIP_LINKS: Record<string, string[]> = {
  "PP-91823412": ["sip_pp_flexi"],
  "AX-77124908": ["sip_axis_blue"],
  "QT-30219844": ["sip_quant_small"],
  "MO-50912387": ["sip_mosl_nasdaq"],
};

function buildRecentTxns(holding: Holding, seedShift: number): FolioRecentTxn[] {
  const seed = holding.id.split("").reduce((s, c) => s + c.charCodeAt(0), 0) + seedShift;
  let r = seed;
  const today = new Date("2026-04-16");
  const types: FolioRecentTxn["type"][] = holding.sip
    ? ["sip", "sip", "sip", "purchase"]
    : ["purchase", "dividend", "purchase"];
  return types.map((type, i) => {
    r = (r * 9301 + 49297) % 233280;
    const monthsBack = i + 1;
    const date = new Date(today);
    date.setMonth(today.getMonth() - monthsBack);
    const amount =
      type === "sip"
        ? 5000 + (r % 11) * 1000
        : type === "dividend"
          ? 500 + (r % 8) * 250
          : 25_000 + (r % 12) * 5_000;
    const nav = holding.currentNav * (0.92 + (r % 100) / 1000);
    return {
      id: `${holding.id}_t${i}`,
      date: date.toISOString(),
      type,
      amount,
      units: +(amount / nav).toFixed(3),
      nav: +nav.toFixed(2),
      status: "completed",
    };
  });
}

function buildFolios(): Record<string, FolioDetail> {
  const groups = new Map<string, Holding[]>();
  for (const h of HOLDINGS) {
    const arr = groups.get(h.amc) ?? [];
    arr.push(h);
    groups.set(h.amc, arr);
  }

  const out: Record<string, FolioDetail> = {};
  for (const [amc, holdings] of groups) {
    const meta = AMC_TO_FOLIO[amc] ?? {
      folio: `XX-${Math.floor(10_000_000 + Math.random() * 89_999_999)}`,
      registrar: "CAMS" as const,
      openedOn: "2024-01-01",
    };
    const totalInvested = holdings.reduce((s, h) => s + h.invested, 0);
    const totalCurrentValue = holdings.reduce((s, h) => s + h.currentValue, 0);
    const totalUnrealizedGain = totalCurrentValue - totalInvested;
    const recent = holdings
      .flatMap((h, i) => buildRecentTxns(h, i))
      .sort((a, b) => +new Date(b.date) - +new Date(a.date))
      .slice(0, 10);
    out[meta.folio] = {
      folioNumber: meta.folio,
      amc,
      registrar: meta.registrar,
      openedOn: meta.openedOn,
      holdings,
      totalInvested,
      totalCurrentValue,
      totalUnrealizedGain,
      totalReturnPct: (totalUnrealizedGain / totalInvested) * 100,
      recentTransactions: recent,
      linkedSipIds: SIP_LINKS[meta.folio] ?? [],
      linkedBankAccountId: "ba_hdfc_primary",
      nominees: [
        { name: "Saanvi Mehta", relation: "Spouse", sharePct: 60 },
        { name: "Rohan Mehta", relation: "Father", sharePct: 40 },
      ],
    };
  }
  return out;
}

export const FOLIOS_FIXTURE: Record<string, FolioDetail> = buildFolios();

export const FOLIOS_SUMMARY_FIXTURE: FolioSummary[] = Object.values(FOLIOS_FIXTURE).map((f) => ({
  folioNumber: f.folioNumber,
  amc: f.amc,
  schemes: f.holdings.length,
  currentValue: f.totalCurrentValue,
}));

/** Map a holding id → its folio number (for cross-linking in UI). */
export const HOLDING_TO_FOLIO: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const folio of Object.values(FOLIOS_FIXTURE)) {
    for (const h of folio.holdings) map[h.id] = folio.folioNumber;
  }
  return map;
})();

