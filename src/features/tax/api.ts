import { useQuery } from "@tanstack/react-query";
import { TAX_FIXTURE } from "./fixtures";
import type { HarvestSimulationResult, TaxLot, TaxOverview } from "@/types/tax";

const TAX_KEY = ["tax", "overview"] as const;

function delay<T>(value: T, ms = 280): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function useTaxOverviewQuery() {
  return useQuery<TaxOverview>({
    queryKey: TAX_KEY,
    queryFn: () => delay(TAX_FIXTURE),
    staleTime: 60_000,
  });
}

/**
 * Pure simulator — no network. Computes tax impact of selling the given lots,
 * applying the ₹1L LTCG equity exemption.
 */
export function simulateHarvest(lots: TaxLot[], selectedIds: string[]): HarvestSimulationResult {
  const picked = lots.filter((l) => selectedIds.includes(l.id));
  let realizedShortGain = 0;
  let realizedLongGain = 0;
  let netProceeds = 0;
  for (const lot of picked) {
    netProceeds += lot.currentValue;
    if (lot.term === "short") realizedShortGain += lot.gain;
    else realizedLongGain += lot.gain;
  }
  const exemptionUsed = Math.min(Math.max(realizedLongGain, 0), 100_000);
  const longTaxable = Math.max(realizedLongGain - exemptionUsed, 0);
  const shortTaxImpact = Math.max(realizedShortGain, 0) * 0.2;
  const longTaxImpact = longTaxable * 0.125;

  // "Naive" alternative: book everything as short-term (worst case)
  const naive = picked.reduce((s, l) => s + Math.max(l.gain, 0), 0) * 0.2;
  const netTaxSaved = Math.max(naive - (shortTaxImpact + longTaxImpact), 0);

  return {
    selectedLots: picked,
    realizedShortGain,
    realizedLongGain,
    shortTaxImpact,
    longTaxImpact,
    exemptionUsed,
    netTaxSaved,
    netProceeds,
  };
}
