import type { TaxLot, TaxOverview } from "@/types/tax";

const TODAY = new Date("2026-04-16");

function daysBetween(a: Date, b: Date) {
  return Math.floor((b.getTime() - a.getTime()) / 86_400_000);
}

const RAW_LOTS: Omit<TaxLot, "term" | "daysHeld" | "gain">[] = [
  {
    id: "l_pp_2024_01",
    holdingId: "h_pp_flexi",
    schemeName: "Parag Parikh Flexi Cap — Direct Growth",
    amc: "PPFAS",
    assetClass: "equity",
    acquiredOn: "2024-01-15",
    units: 412.5,
    costBasis: 170_000,
    currentValue: 217_762,
  },
  {
    id: "l_pp_2025_07",
    holdingId: "h_pp_flexi",
    schemeName: "Parag Parikh Flexi Cap — Direct Growth",
    amc: "PPFAS",
    assetClass: "equity",
    acquiredOn: "2025-07-12",
    units: 280.4,
    costBasis: 138_900,
    currentValue: 148_058,
  },
  {
    id: "l_axis_2023_05",
    holdingId: "h_axis_blue",
    schemeName: "Axis Bluechip — Direct Growth",
    amc: "Axis MF",
    assetClass: "equity",
    acquiredOn: "2023-05-22",
    units: 3_120.2,
    costBasis: 150_400,
    currentValue: 196_127,
  },
  {
    id: "l_mirae_2025_11",
    holdingId: "h_mirae_mid",
    schemeName: "Mirae Asset Midcap — Direct Growth",
    amc: "Mirae",
    assetClass: "equity",
    acquiredOn: "2025-11-04",
    units: 1_240.0,
    costBasis: 92_100,
    currentValue: 84_500,
  },
  {
    id: "l_quant_2025_09",
    holdingId: "h_quant_small",
    schemeName: "Quant Small Cap — Direct Growth",
    amc: "Quant MF",
    assetClass: "equity",
    acquiredOn: "2025-09-18",
    units: 412.0,
    costBasis: 88_000,
    currentValue: 76_400,
  },
  {
    id: "l_quant_2024_04",
    holdingId: "h_quant_small",
    schemeName: "Quant Small Cap — Direct Growth",
    amc: "Quant MF",
    assetClass: "equity",
    acquiredOn: "2024-04-10",
    units: 218.4,
    costBasis: 60_500,
    currentValue: 89_120,
  },
  {
    id: "l_hdfc_2023_02",
    holdingId: "h_hdfc_corp",
    schemeName: "HDFC Corporate Bond — Direct Growth",
    amc: "HDFC MF",
    assetClass: "debt",
    acquiredOn: "2023-02-08",
    units: 18_500,
    costBasis: 480_000,
    currentValue: 552_300,
  },
  {
    id: "l_sbi_gold_2024_10",
    holdingId: "h_sbi_gold",
    schemeName: "SBI Gold — Direct Growth",
    amc: "SBI MF",
    assetClass: "gold",
    acquiredOn: "2024-10-22",
    units: 1_240,
    costBasis: 78_000,
    currentValue: 96_500,
  },
  {
    id: "l_kotak_2025_03",
    holdingId: "h_kotak_intl",
    schemeName: "Kotak Global Innovation — Direct Growth",
    amc: "Kotak MF",
    assetClass: "international",
    acquiredOn: "2025-03-19",
    units: 982.0,
    costBasis: 110_000,
    currentValue: 124_400,
  },
];

const LOTS: TaxLot[] = RAW_LOTS.map((lot) => {
  const acquired = new Date(lot.acquiredOn);
  const days = daysBetween(acquired, TODAY);
  // Equity LTCG threshold = 365 days; debt/gold/intl = 730 (simplified).
  const longThreshold = lot.assetClass === "equity" ? 365 : 730;
  const term = days >= longThreshold ? "long" : "short";
  const gain = lot.currentValue - lot.costBasis;
  return { ...lot, gain, term, daysHeld: days };
});

const realizedShort = 18_400;
const realizedLong = 42_500;

const unrealizedShort = LOTS.filter((l) => l.term === "short").reduce((s, l) => s + Math.max(l.gain, 0), 0);
const unrealizedLong = LOTS.filter((l) => l.term === "long").reduce((s, l) => s + Math.max(l.gain, 0), 0);

export const TAX_FIXTURE: TaxOverview = {
  financialYear: "FY 2025-26",
  asOf: "2026-04-16",
  shortTerm: {
    realizedGain: realizedShort,
    unrealizedGain: unrealizedShort,
    effectiveRatePct: 20,
    estimatedLiability: realizedShort * 0.2,
  },
  longTerm: {
    realizedGain: realizedLong,
    unrealizedGain: unrealizedLong,
    exemptionAvailable: Math.max(100_000 - realizedLong, 0),
    effectiveRatePct: 12.5,
    estimatedLiability: Math.max(realizedLong - 100_000, 0) * 0.125,
  },
  ltcgEquityExemption: 100_000,
  carryForwardLoss: 24_800,
  lots: LOTS,
};
