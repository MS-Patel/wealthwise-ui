export type GainTerm = "short" | "long";

export interface TaxLot {
  id: string;
  holdingId: string;
  schemeName: string;
  amc: string;
  assetClass: "equity" | "debt" | "hybrid" | "gold" | "international";
  acquiredOn: string; // ISO
  units: number;
  costBasis: number; // total INR
  currentValue: number; // total INR
  gain: number; // currentValue - costBasis
  term: GainTerm;
  daysHeld: number;
}

export interface TaxBucket {
  realizedGain: number; // already booked this FY
  unrealizedGain: number; // sitting in current lots
  exemptionAvailable?: number; // e.g. ₹1L LTCG equity exemption
  effectiveRatePct: number;
  estimatedLiability: number;
}

export interface TaxOverview {
  financialYear: string; // e.g. "FY 2025-26"
  asOf: string;
  shortTerm: TaxBucket;
  longTerm: TaxBucket;
  ltcgEquityExemption: number; // ₹1,00,000 default
  carryForwardLoss: number;
  lots: TaxLot[];
}

export interface HarvestSimulationInput {
  lotIds: string[];
}

export interface HarvestSimulationResult {
  selectedLots: TaxLot[];
  realizedShortGain: number;
  realizedLongGain: number;
  shortTaxImpact: number;
  longTaxImpact: number;
  exemptionUsed: number;
  netTaxSaved: number; // vs naive booking
  netProceeds: number;
}
