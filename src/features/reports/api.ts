import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { REPORT_JOBS_FIXTURE } from "./fixtures";
import type { ReportJob, ReportRequest } from "@/types/reports";

const REPORTS_KEY = ["reports", "jobs"] as const;

function delay<T>(value: T, ms = 280): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// In-memory store so newly requested reports show up in the history list
let store: ReportJob[] = [...REPORT_JOBS_FIXTURE];

export function useReportJobsQuery() {
  return useQuery<ReportJob[]>({
    queryKey: REPORTS_KEY,
    queryFn: () => delay(store),
    staleTime: 30_000,
  });
}

export function useRequestReportMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (req: ReportRequest) => {
      const id = `rpt_${Date.now().toString(36)}`;
      const job: ReportJob = {
        id,
        kind: req.kind,
        format: req.format,
        period: req.period,
        fromDate: req.fromDate,
        toDate: req.toDate,
        status: "processing",
        requestedAt: new Date().toISOString(),
      };
      store = [job, ...store];
      // simulate async generation
      setTimeout(() => {
        store = store.map((j) =>
          j.id === id
            ? {
                ...j,
                status: "ready",
                readyAt: new Date().toISOString(),
                fileSizeKb: 60 + Math.floor(Math.random() * 420),
                downloadUrl: "#",
              }
            : j,
        );
        qc.invalidateQueries({ queryKey: REPORTS_KEY });
      }, 1600);
      return delay(job, 320);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: REPORTS_KEY });
    },
  });
}
