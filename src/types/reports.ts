export type ReportKind = "wealth" | "pnl" | "capital_gain" | "transaction_statement";

export type ReportFormat = "pdf" | "xlsx" | "csv";

export type ReportPeriod = "current_fy" | "previous_fy" | "last_30d" | "last_90d" | "ytd" | "custom";

export interface ReportRequest {
  kind: ReportKind;
  format: ReportFormat;
  period: ReportPeriod;
  fromDate?: string;
  toDate?: string;
  email?: boolean;
}

export interface ReportJob {
  id: string;
  kind: ReportKind;
  format: ReportFormat;
  period: ReportPeriod;
  fromDate?: string;
  toDate?: string;
  status: "queued" | "processing" | "ready" | "failed";
  requestedAt: string;
  readyAt?: string;
  fileSizeKb?: number;
  downloadUrl?: string;
}
