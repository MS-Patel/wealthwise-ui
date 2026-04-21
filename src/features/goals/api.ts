import { useQuery } from "@tanstack/react-query";
import { GOALS_FIXTURE } from "./fixtures";
import type { GoalsOverview } from "@/types/goals";

const GOALS_KEY = ["goals", "overview"] as const;

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function useGoalsOverviewQuery() {
  return useQuery<GoalsOverview>({
    queryKey: GOALS_KEY,
    queryFn: () => delay(GOALS_FIXTURE),
    staleTime: 60_000,
  });
}
