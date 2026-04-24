import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ActiveSip, UpcomingInstallment } from "@/types/sip";
import { ACTIVE_SIPS_FIXTURE, UPCOMING_INSTALLMENTS_FIXTURE } from "./fixtures";

const SIPS_KEY = ["sips", "active"] as const;
const INSTALLMENTS_KEY = ["sips", "installments"] as const;

function delay<T>(value: T, ms = 320): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/* ─── Queries ──────────────────────────────────────────────────────── */

export function useActiveSipsQuery() {
  return useQuery<ActiveSip[]>({
    queryKey: SIPS_KEY,
    queryFn: () => delay(ACTIVE_SIPS_FIXTURE),
    staleTime: 60_000,
  });
}

export function useUpcomingInstallmentsQuery() {
  return useQuery<UpcomingInstallment[]>({
    queryKey: INSTALLMENTS_KEY,
    queryFn: () => delay(UPCOMING_INSTALLMENTS_FIXTURE, 280),
    staleTime: 60_000,
  });
}

/* ─── Mutations (optimistic in-memory) ─────────────────────────────── */

function patchSip(qc: ReturnType<typeof useQueryClient>, id: string, patch: Partial<ActiveSip>) {
  qc.setQueryData<ActiveSip[]>(SIPS_KEY, (prev) =>
    (prev ?? ACTIVE_SIPS_FIXTURE).map((s) => (s.id === id ? { ...s, ...patch } : s)),
  );
}

export function usePauseSipMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await delay(null, 400);
      return id;
    },
    onSuccess: (id) => patchSip(qc, id, { status: "paused" }),
  });
}

export function useResumeSipMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await delay(null, 400);
      return id;
    },
    onSuccess: (id) => patchSip(qc, id, { status: "active" }),
  });
}

export function useCancelSipMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await delay(null, 400);
      return id;
    },
    onSuccess: (id) => patchSip(qc, id, { status: "cancelled", endDate: new Date().toISOString() }),
  });
}
