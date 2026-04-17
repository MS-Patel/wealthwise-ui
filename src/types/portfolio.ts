export type AssetClass = "equity" | "debt" | "hybrid" | "gold" | "international" | "cash";

export type FundCategory =
  | "Large Cap"
  | "Mid Cap"
  | "Small Cap"
  | "Flexi Cap"
  | "ELSS"
  | "Liquid"
  | "Short Duration"
  | "Corporate Bond"
  | "Gilt"
  | "Hybrid Aggressive"
  | "Gold ETF"
  | "International";

export interface Holding {
  id: string;
  schemeCode: string;
  schemeName: string;
  amc: string;
  category: FundCategory;
  assetClass: AssetClass;
  units: number;
  avgNav: number;
  currentNav: number;
  invested: number;
  currentValue: number;
  unrealizedGain: number;
  returnPct: number; // absolute %
  xirr: number;
  sip: boolean;
  navAsOf: string; // ISO date
}

export interface PortfolioSummary {
  netWorth: number;
  invested: number;
  currentValue: number;
  unrealizedGain: number;
  absoluteReturnPct: number;
  xirr: number;
  todayChange: number;
  todayChangePct: number;
  monthlySip: number;
  asOf: string;
}

export interface AllocationSlice {
  key: string;
  label: string;
  value: number;
  percent: number;
}

export interface PerformancePoint {
  date: string; // ISO
  invested: number;
  value: number;
}

export interface SectorAllocation {
  sector: string;
  weight: number;
}

export interface PortfolioOverview {
  summary: PortfolioSummary;
  byAssetClass: AllocationSlice[];
  byCategory: AllocationSlice[];
  bySector: SectorAllocation[];
  performance: PerformancePoint[];
  topHoldings: Holding[];
}
