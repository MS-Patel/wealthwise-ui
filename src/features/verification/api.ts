import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { NdmlKycStatusResult, PanVerificationResult } from "@/types/verification";
import { buildNdmlResult, buildPanResult } from "./fixtures";
import type { NdmlStatusValues, PanVerifyValues } from "./schemas";

const PAN_HISTORY_KEY = ["verification", "pan", "history"] as const;
const NDML_HISTORY_KEY = ["verification", "ndml", "history"] as const;

let panHistory: PanVerificationResult[] = [];
let ndmlHistory: NdmlKycStatusResult[] = [];

function delay<T>(value: T, ms = 600): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function usePanHistoryQuery() {
  return useQuery<PanVerificationResult[]>({
    queryKey: PAN_HISTORY_KEY,
    queryFn: () => Promise.resolve(panHistory),
    staleTime: 30_000,
  });
}

export function useNdmlHistoryQuery() {
  return useQuery<NdmlKycStatusResult[]>({
    queryKey: NDML_HISTORY_KEY,
    queryFn: () => Promise.resolve(ndmlHistory),
    staleTime: 30_000,
  });
}

export function useVerifyPanMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: PanVerifyValues) => {
      const result = buildPanResult(values.pan, values.fullName);
      panHistory = [result, ...panHistory].slice(0, 8);
      return delay(result, 700);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PAN_HISTORY_KEY });
    },
  });
}

export function useNdmlKycStatusMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: NdmlStatusValues) => {
      const result = buildNdmlResult(values.pan);
      ndmlHistory = [result, ...ndmlHistory].slice(0, 8);
      return delay(result, 700);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NDML_HISTORY_KEY });
    },
  });
}
