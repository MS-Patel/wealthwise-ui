import { useQuery } from "@tanstack/react-query";
import { INSIGHTS_FIXTURE } from "./fixtures";
import type { InsightsOverview } from "@/types/insights";

const INSIGHTS_KEY = ["insights", "overview"] as const;

function delay<T>(value: T, ms = 320): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function useInsightsOverviewQuery() {
  return useQuery<InsightsOverview>({
    queryKey: INSIGHTS_KEY,
    queryFn: () => delay(INSIGHTS_FIXTURE),
    staleTime: 60_000,
  });
}
