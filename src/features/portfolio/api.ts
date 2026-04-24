import { useQuery } from "@tanstack/react-query";
import { FOLIOS_FIXTURE, FOLIOS_SUMMARY_FIXTURE, HOLDINGS_FIXTURE, PORTFOLIO_FIXTURE } from "./fixtures";
import type { FolioDetail, FolioSummary, Holding, PortfolioOverview } from "@/types/portfolio";

/**
 * Mock portfolio API. Real wiring should call:
 *   api.get<PortfolioOverview>('/portfolio/overview/')
 *   api.get<PaginatedResponse<Holding>>('/portfolio/holdings/', { params })
 *   api.get<FolioDetail>(`/portfolio/folios/${folioNumber}/`)
 * The hook contracts here will not change.
 */

const PORTFOLIO_KEY = ["portfolio", "overview"] as const;
const HOLDINGS_KEY = ["portfolio", "holdings"] as const;
const FOLIOS_KEY = ["portfolio", "folios"] as const;

function delay<T>(value: T, ms = 320): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function usePortfolioOverviewQuery() {
  return useQuery<PortfolioOverview>({
    queryKey: PORTFOLIO_KEY,
    queryFn: () => delay(PORTFOLIO_FIXTURE),
    staleTime: 60_000,
  });
}

export function useHoldingsQuery() {
  return useQuery<Holding[]>({
    queryKey: HOLDINGS_KEY,
    queryFn: () => delay(HOLDINGS_FIXTURE, 380),
    staleTime: 60_000,
  });
}

export function useFoliosSummaryQuery() {
  return useQuery<FolioSummary[]>({
    queryKey: FOLIOS_KEY,
    queryFn: () => delay(FOLIOS_SUMMARY_FIXTURE, 280),
    staleTime: 60_000,
  });
}

export function useFolioDetailQuery(folioNumber: string) {
  return useQuery<FolioDetail | null>({
    queryKey: [...FOLIOS_KEY, folioNumber],
    queryFn: () => delay(FOLIOS_FIXTURE[folioNumber] ?? null, 320),
    staleTime: 60_000,
    enabled: !!folioNumber,
  });
}
