import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Mandate } from "@/types/mandate";
import { MANDATES_FIXTURE } from "./fixtures";
import { KYC_FIXTURE } from "@/features/kyc/fixtures";
import type { CreateMandateValues } from "./schemas";

const MANDATES_KEY = ["mandates", "list"] as const;

function delay<T>(value: T, ms = 320): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function useMandatesQuery() {
  return useQuery<Mandate[]>({
    queryKey: MANDATES_KEY,
    queryFn: () => delay(MANDATES_FIXTURE),
    staleTime: 60_000,
  });
}

export function useCreateMandateMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: CreateMandateValues): Promise<Mandate> => {
      await delay(null, 600);
      const bank = KYC_FIXTURE.bankAccounts.find((b) => b.id === values.bankAccountId);
      const newMandate: Mandate = {
        id: `mand_${Date.now()}`,
        bankAccountId: values.bankAccountId,
        bankName: bank?.bankName ?? "Bank",
        accountMasked: bank?.accountNumberMasked ?? "XXXXXXXXXX",
        amountLimit: values.amountLimit,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      return newMandate;
    },
    onSuccess: (mandate) => {
      qc.setQueryData<Mandate[]>(MANDATES_KEY, (prev) => [mandate, ...(prev ?? MANDATES_FIXTURE)]);
    },
  });
}

export function useRetryMandateMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await delay(null, 500);
      return id;
    },
    onSuccess: (id) => {
      qc.setQueryData<Mandate[]>(MANDATES_KEY, (prev) =>
        (prev ?? MANDATES_FIXTURE).map((m) =>
          m.id === id
            ? { ...m, status: "pending", failureReason: undefined, createdAt: new Date().toISOString() }
            : m,
        ),
      );
    },
  });
}
