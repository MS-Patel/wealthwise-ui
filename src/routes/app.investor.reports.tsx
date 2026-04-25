import { useMemo, useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format as formatDateFns } from "date-fns";
import {
  BarChart3,
  CalendarIcon,
  Calculator,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  PieChart,
  ReceiptText,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { TableSkeleton } from "@/components/feedback/skeletons";
import { StatusBadge, type StatusTone } from "@/components/feedback/status-badge";
import { DataTable, type DataTableColumn } from "@/components/data/data-table";

import { useAuthStore } from "@/stores/auth-store";
import { ROLE_HOME } from "@/features/auth/role-routes";
import { useReportJobsQuery, useRequestReportMutation } from "@/features/reports/api";
import { reportRequestSchema, type ReportRequestFormValues } from "@/features/reports/schemas";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ReportFormat, ReportJob, ReportKind, ReportPeriod } from "@/types/reports";

export const Route = createFileRoute("/app/investor/reports")({
  beforeLoad: () => {
    const { user } = useAuthStore.getState();
    if (user && user.role !== "investor") throw redirect({ to: ROLE_HOME[user.role] });
  },
  head: () => ({ meta: [{ title: "Reports & Analytics — BuyBestFin" }] }),
  component: ReportsPage,
});

interface ReportSpec {
  kind: ReportKind;
  title: string;
  description: string;
  icon: LucideIcon;
  tone: string;
  defaultFormat: ReportFormat;
  formats: ReportFormat[];
  defaultPeriod: ReportPeriod;
}

const REPORT_SPECS: ReportSpec[] = [
  {
    kind: "wealth",
    title: "Wealth Report",
    description:
      "End-to-end snapshot of holdings, allocation, XIRR, SIPs and goal progress as of today.",
    icon: PieChart,
    tone: "from-primary/12 to-primary/0 text-primary",
    defaultFormat: "pdf",
    formats: ["pdf", "xlsx"],
    defaultPeriod: "current_fy",
  },
  {
    kind: "pnl",
    title: "P&L Report",
    description:
      "Realised and unrealised gains, scheme-wise performance, dividends and switches over the period.",
    icon: BarChart3,
    tone: "from-info/15 to-info/0 text-info",
    defaultFormat: "xlsx",
    formats: ["pdf", "xlsx", "csv"],
    defaultPeriod: "current_fy",
  },
  {
    kind: "capital_gain",
    title: "Capital Gain Report",
    description:
      "STCG / LTCG breakdown by scheme with indexed cost — ready for your CA or ITR filing.",
    icon: Calculator,
    tone: "from-warning/15 to-warning/0 text-warning",
    defaultFormat: "pdf",
    formats: ["pdf", "xlsx"],
    defaultPeriod: "previous_fy",
  },
  {
    kind: "transaction_statement",
    title: "Transaction Statement",
    description:
      "Folio-wise ledger of every purchase, SIP, redemption, switch and dividend in the period.",
    icon: ReceiptText,
    tone: "from-accent/18 to-accent/0 text-accent",
    defaultFormat: "csv",
    formats: ["pdf", "xlsx", "csv"],
    defaultPeriod: "last_90d",
  },
];

const KIND_LABEL: Record<ReportKind, string> = {
  wealth: "Wealth Report",
  pnl: "P&L Report",
  capital_gain: "Capital Gain Report",
  transaction_statement: "Transaction Statement",
};

const KIND_ICON: Record<ReportKind, LucideIcon> = {
  wealth: PieChart,
  pnl: BarChart3,
  capital_gain: Calculator,
  transaction_statement: ReceiptText,
};

const PERIOD_LABEL: Record<ReportPeriod, string> = {
  current_fy: "Current FY (2025-26)",
  previous_fy: "Previous FY (2024-25)",
  last_30d: "Last 30 days",
  last_90d: "Last 90 days",
  ytd: "Calendar YTD",
  custom: "Custom range",
};

const FORMAT_LABEL: Record<ReportFormat, string> = {
  pdf: "PDF",
  xlsx: "Excel",
  csv: "CSV",
};

const FORMAT_ICON: Record<ReportFormat, LucideIcon> = {
  pdf: FileText,
  xlsx: FileSpreadsheet,
  csv: FileSpreadsheet,
};

const STATUS_TONE: Record<ReportJob["status"], StatusTone> = {
  queued: "info",
  processing: "warning",
  ready: "success",
  failed: "destructive",
};

const STATUS_LABEL: Record<ReportJob["status"], string> = {
  queued: "Queued",
  processing: "Processing",
  ready: "Ready",
  failed: "Failed",
};

function ReportsPage() {
  const { data, isLoading } = useReportJobsQuery();
  const request = useRequestReportMutation();
  const [filter, setFilter] = useState<"all" | ReportKind>("all");

  const jobs = useMemo(() => {
    if (!data) return [];
    return filter === "all" ? data : data.filter((j) => j.kind === filter);
  }, [data, filter]);

  const columns: DataTableColumn<ReportJob>[] = [
    {
      id: "kind",
      header: "Report",
      sortValue: (r) => r.kind,
      accessor: (r) => {
        const Icon = KIND_ICON[r.kind];
        return (
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-secondary/60 text-primary">
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{KIND_LABEL[r.kind]}</p>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {PERIOD_LABEL[r.period]}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      id: "format",
      header: "Format",
      accessor: (r) => (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold uppercase tracking-wider">
          {FORMAT_LABEL[r.format]}
        </span>
      ),
    },
    {
      id: "requestedAt",
      header: "Requested",
      sortValue: (r) => +new Date(r.requestedAt),
      accessor: (r) => <span className="text-sm">{formatDate(r.requestedAt)}</span>,
    },
    {
      id: "size",
      header: "Size",
      align: "right",
      sortValue: (r) => r.fileSizeKb ?? 0,
      accessor: (r) => (
        <span className="text-sm tabular-nums text-muted-foreground">
          {r.fileSizeKb ? `${r.fileSizeKb} KB` : "—"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessor: (r) => <StatusBadge tone={STATUS_TONE[r.status]} label={STATUS_LABEL[r.status]} />,
    },
    {
      id: "actions",
      header: "",
      align: "right",
      accessor: (r) => (
        <Button
          size="sm"
          variant={r.status === "ready" ? "default" : "outline"}
          disabled={r.status !== "ready"}
          className="gap-1.5"
          onClick={() => handleDownload(r)}
        >
          {r.status === "processing" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
          {r.status === "ready" ? "Download" : "Pending"}
        </Button>
      ),
    },
  ];

  function handleDownload(job: ReportJob) {
    toast.success(`${KIND_LABEL[job.kind]} downloaded`, {
      description: `${FORMAT_LABEL[job.format]} · ${PERIOD_LABEL[job.period]} · ${job.fileSizeKb ?? "—"} KB`,
    });
  }

  return (
    <>
      <PageHeader
        eyebrow="Reports"
        title="Reports & Analytics"
        description="Generate Wealth, P&L, Capital Gain and Transaction statements — download as PDF, Excel or CSV for your records or CA."
      />

      <div className="space-y-6 px-6 py-6 sm:px-8">
        <div className="grid gap-4 md:grid-cols-2">
          {REPORT_SPECS.map((spec) => (
            <ReportCard
              key={spec.kind}
              spec={spec}
              isPending={request.isPending && request.variables?.kind === spec.kind}
              onGenerate={(values) => {
                const { format, period, fromDate, toDate } = values;
                const rangeNote =
                  period === "custom" && fromDate && toDate
                    ? `${formatDate(fromDate.toISOString())} → ${formatDate(toDate.toISOString())}`
                    : PERIOD_LABEL[period];
                request.mutate(
                  {
                    kind: spec.kind,
                    format,
                    period,
                    fromDate: fromDate?.toISOString(),
                    toDate: toDate?.toISOString(),
                  },
                  {
                    onSuccess: () => {
                      toast.success(`${KIND_LABEL[spec.kind]} queued`, {
                        description: `${FORMAT_LABEL[format]} · ${rangeNote} — usually ready in a minute.`,
                      });
                    },
                    onError: () => {
                      toast.error("Couldn't queue the report. Please try again.");
                    },
                  },
                );
              }}
            />
          ))}
        </div>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
            <div>
              <CardTitle className="text-lg">Recent reports</CardTitle>
              <CardDescription>Re-download any report generated in the last 90 days.</CardDescription>
            </div>
            <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All reports" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All reports</SelectItem>
                {REPORT_SPECS.map((s) => (
                  <SelectItem key={s.kind} value={s.kind}>
                    {KIND_LABEL[s.kind]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            {isLoading ? (
              <TableSkeleton rows={4} cols={6} />
            ) : (
              <DataTable
                columns={columns}
                data={jobs}
                initialSortId="requestedAt"
                initialSortDir="desc"
                pageSize={8}
                mobileCard={(r) => {
                  const Icon = KIND_ICON[r.kind];
                  return (
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="grid h-9 w-9 place-items-center rounded-md bg-secondary/60 text-primary">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{KIND_LABEL[r.kind]}</p>
                            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                              {PERIOD_LABEL[r.period]} · {FORMAT_LABEL[r.format]}
                            </p>
                          </div>
                        </div>
                        <StatusBadge tone={STATUS_TONE[r.status]} label={STATUS_LABEL[r.status]} />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatDate(r.requestedAt)}</span>
                        <Button
                          size="sm"
                          variant={r.status === "ready" ? "default" : "outline"}
                          disabled={r.status !== "ready"}
                          className="gap-1.5"
                          onClick={() => handleDownload(r)}
                        >
                          <Download className="h-3.5 w-3.5" /> Download
                        </Button>
                      </div>
                    </div>
                  );
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

interface ReportCardProps {
  spec: ReportSpec;
  isPending: boolean;
  onGenerate: (values: ReportRequestFormValues) => void;
}

function ReportCard({ spec, isPending, onGenerate }: ReportCardProps) {
  const Icon = spec.icon;

  const form = useForm<ReportRequestFormValues>({
    resolver: zodResolver(reportRequestSchema),
    mode: "onChange",
    defaultValues: {
      format: spec.defaultFormat,
      period: spec.defaultPeriod,
      fromDate: undefined,
      toDate: undefined,
    },
  });

  const period = form.watch("period");
  const format = form.watch("format");
  const FormatIcon = FORMAT_ICON[format];
  const today = useMemo(() => new Date(), []);

  return (
    <Card className="overflow-hidden shadow-card">
      <div className={cn("h-24 bg-gradient-to-br", spec.tone)}>
        <div className="flex h-full items-end justify-between p-5">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-background/85 shadow-sm backdrop-blur">
            <Icon className="h-6 w-6" />
          </span>
          <Badge variant="outline" className="bg-background/85 backdrop-blur">
            <Wallet className="mr-1 h-3 w-3" /> Free
          </Badge>
        </div>
      </div>
      <CardContent className="space-y-4 p-5">
        <div>
          <h3 className="text-base font-semibold">{spec.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{spec.description}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onGenerate)} className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="period"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-medium text-muted-foreground">Period</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(v) => {
                        field.onChange(v as ReportPeriod);
                        if (v !== "custom") {
                          form.setValue("fromDate", undefined, { shouldValidate: true });
                          form.setValue("toDate", undefined, { shouldValidate: true });
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Period" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.keys(PERIOD_LABEL) as ReportPeriod[]).map((p) => (
                          <SelectItem key={p} value={p}>
                            {PERIOD_LABEL[p]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="format"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-medium text-muted-foreground">Format</FormLabel>
                    <Select value={field.value} onValueChange={(v) => field.onChange(v as ReportFormat)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Format" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {spec.formats.map((f) => (
                          <SelectItem key={f} value={f}>
                            {FORMAT_LABEL[f]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            {period === "custom" && (
              <div className="grid gap-2 rounded-lg border border-dashed border-border bg-secondary/30 p-3 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="fromDate"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-medium text-muted-foreground">From</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                              {field.value ? formatDateFns(field.value, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > today || date < new Date("2000-01-01")}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="toDate"
                  render={({ field }) => {
                    const fromVal = form.watch("fromDate");
                    return (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-xs font-medium text-muted-foreground">To</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                type="button"
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                                {field.value ? formatDateFns(field.value, "PPP") : <span>Pick a date</span>}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > today || (fromVal ? date < fromVal : date < new Date("2000-01-01"))
                              }
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    );
                  }}
                />
              </div>
            )}

            <Button type="submit" className="w-full gap-2" disabled={isPending}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FormatIcon className="h-4 w-4" />
              )}
              {isPending ? "Queuing…" : `Generate ${FORMAT_LABEL[format]}`}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
