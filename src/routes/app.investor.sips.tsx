import { useMemo, useState } from "react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  AlertTriangle,
  CalendarClock,
  CircleDollarSign,
  Pause,
  Play,
  Plus,
  Repeat,
  TrendingUp,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DataTable, type DataTableColumn } from "@/components/data/data-table";
import { StatusBadge, type StatusTone } from "@/components/feedback/status-badge";
import { ChartSkeleton } from "@/components/feedback/skeletons";
import { cn } from "@/lib/utils";
import { formatINR, formatDate } from "@/lib/format";
import { useAuthStore } from "@/stores/auth-store";
import { ROLE_HOME } from "@/features/auth/role-routes";

import {
  useActiveSipsQuery,
  useUpcomingInstallmentsQuery,
  usePauseSipMutation,
  useResumeSipMutation,
  useCancelSipMutation,
} from "@/features/sips/api";
import { useMandatesQuery } from "@/features/mandates/api";
import { MandateCard } from "@/features/mandates/components/mandate-card";
import { CreateMandateDialog } from "@/features/mandates/components/create-mandate-dialog";
import type { ActiveSip, InstallmentStatus, SipStatus, UpcomingInstallment } from "@/types/sip";

export const Route = createFileRoute("/app/investor/sips")({
  beforeLoad: () => {
    const { user, isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) throw redirect({ to: "/login" });
    if (user && user.role !== "investor") throw redirect({ to: ROLE_HOME[user.role] });
  },
  head: () => ({
    meta: [
      { title: "SIPs — BuyBestFin" },
      {
        name: "description",
        content: "Manage your active SIPs, mandates, and upcoming installments.",
      },
    ],
  }),
  component: SipDashboardPage,
});

const STATUS_TONE: Record<SipStatus, StatusTone> = {
  active: "success",
  paused: "warning",
  cancelled: "muted",
  completed: "info",
};
const STATUS_LABEL: Record<SipStatus, string> = {
  active: "Active",
  paused: "Paused",
  cancelled: "Cancelled",
  completed: "Completed",
};

const INSTALLMENT_TONE: Record<InstallmentStatus, StatusTone> = {
  scheduled: "info",
  processing: "warning",
  failed: "destructive",
};
const INSTALLMENT_LABEL: Record<InstallmentStatus, string> = {
  scheduled: "Scheduled",
  processing: "Processing",
  failed: "Failed",
};

function SipDashboardPage() {
  const { data: sips, isLoading } = useActiveSipsQuery();
  const { data: installments, isLoading: instLoading } = useUpcomingInstallmentsQuery();
  const { data: mandates, isLoading: mandatesLoading } = useMandatesQuery();

  const pause = usePauseSipMutation();
  const resume = useResumeSipMutation();
  const cancel = useCancelSipMutation();

  const [createMandateOpen, setCreateMandateOpen] = useState(false);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  const list = sips ?? [];
  const active = list.filter((s) => s.status === "active");
  const paused = list.filter((s) => s.status === "paused");
  const ended = list.filter((s) => s.status === "cancelled" || s.status === "completed");

  const summary = useMemo(() => {
    const totalMonthly = active.reduce((sum, s) => sum + s.monthlyAmount, 0);
    const nextDate = active
      .map((s) => +new Date(s.nextInstallmentDate))
      .sort((a, b) => a - b)[0];
    const failedRecent = (installments ?? []).filter((i) => i.status === "failed").length;
    return {
      activeCount: active.length,
      totalMonthly,
      nextDateIso: nextDate ? new Date(nextDate).toISOString() : null,
      failedRecent,
    };
  }, [active, installments]);

  async function handleAction(action: "pause" | "resume" | "cancel", id: string) {
    try {
      if (action === "pause") {
        await pause.mutateAsync(id);
        toast.success("SIP paused");
      } else if (action === "resume") {
        await resume.mutateAsync(id);
        toast.success("SIP resumed");
      } else {
        await cancel.mutateAsync(id);
        toast.success("SIP cancelled");
      }
    } catch {
      toast.error("Action failed. Please try again.");
    }
  }

  const cancelTarget = list.find((s) => s.id === confirmCancelId);

  return (
    <>
      <PageHeader
        eyebrow="Invest"
        title="My SIPs"
        description="Review active SIPs, manage mandates, and track upcoming installments."
        actions={
          <Button asChild className="gap-2">
            <Link to="/app/investor/orders/sip">
              <Plus className="h-4 w-4" /> Start new SIP
            </Link>
          </Button>
        }
      />

      <div className="space-y-6 px-6 py-6 sm:px-8">
        {/* Summary strip */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <SummaryStat
            icon={Repeat}
            label="Active SIPs"
            value={summary.activeCount.toString()}
            tone="info"
          />
          <SummaryStat
            icon={CircleDollarSign}
            label="Monthly outflow"
            value={formatINR(summary.totalMonthly)}
            tone="success"
          />
          <SummaryStat
            icon={CalendarClock}
            label="Next debit"
            value={summary.nextDateIso ? formatDate(summary.nextDateIso) : "—"}
            tone="muted"
          />
          <SummaryStat
            icon={AlertTriangle}
            label="Failed (last 30d)"
            value={summary.failedRecent.toString()}
            tone={summary.failedRecent > 0 ? "destructive" : "muted"}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active" className="space-y-5">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
            <TabsTrigger value="paused">Paused ({paused.length})</TabsTrigger>
            <TabsTrigger value="ended">Ended ({ended.length})</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming installments</TabsTrigger>
            <TabsTrigger value="mandates">Bank mandates</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <SipListCard
              title="Active SIPs"
              description="Auto-debited as per your registered mandate."
              loading={isLoading}
              sips={active}
              onPause={(id) => handleAction("pause", id)}
              onCancel={(id) => setConfirmCancelId(id)}
            />
          </TabsContent>

          <TabsContent value="paused">
            <SipListCard
              title="Paused SIPs"
              description="No debits will be made until resumed."
              loading={isLoading}
              sips={paused}
              onResume={(id) => handleAction("resume", id)}
              onCancel={(id) => setConfirmCancelId(id)}
            />
          </TabsContent>

          <TabsContent value="ended">
            <SipListCard
              title="Cancelled & Completed"
              description="Historical record of finished SIPs."
              loading={isLoading}
              sips={ended}
            />
          </TabsContent>

          <TabsContent value="upcoming">
            <UpcomingPanel loading={instLoading} items={installments ?? []} />
          </TabsContent>

          <TabsContent value="mandates" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Bank mandates</CardTitle>
                  <CardDescription>
                    NACH e-mandates authorise auto-debit for your SIPs.
                  </CardDescription>
                </div>
                <Button onClick={() => setCreateMandateOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" /> Add mandate
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {mandatesLoading ? (
                  <ChartSkeleton height={120} />
                ) : (mandates ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No mandates yet.</p>
                ) : (
                  (mandates ?? []).map((m) => <MandateCard key={m.id} mandate={m} />)
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <CreateMandateDialog open={createMandateOpen} onOpenChange={setCreateMandateOpen} />

      <AlertDialog open={!!confirmCancelId} onOpenChange={(open) => !open && setConfirmCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this SIP?</AlertDialogTitle>
            <AlertDialogDescription>
              Future installments for{" "}
              <span className="font-semibold text-foreground">{cancelTarget?.schemeName}</span> will
              stop. Existing units stay in your portfolio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep SIP</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmCancelId) handleAction("cancel", confirmCancelId);
                setConfirmCancelId(null);
              }}
            >
              Cancel SIP
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/* ───────────────────────── Sub-components ───────────────────────── */

function SummaryStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Repeat;
  label: string;
  value: string;
  tone: "success" | "info" | "muted" | "destructive";
}) {
  const toneClass = {
    success: "bg-success/12 text-success",
    info: "bg-info/12 text-info",
    muted: "bg-muted text-muted-foreground",
    destructive: "bg-destructive/12 text-destructive",
  }[tone];

  return (
    <Card className="shadow-card">
      <CardContent className="p-5">
        <div className={cn("grid h-9 w-9 place-items-center rounded-xl", toneClass)}>
          <Icon className="h-4 w-4" />
        </div>
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 font-display text-xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}

interface SipListCardProps {
  title: string;
  description: string;
  loading: boolean;
  sips: ActiveSip[];
  onPause?: (id: string) => void;
  onResume?: (id: string) => void;
  onCancel?: (id: string) => void;
}

function SipListCard({
  title,
  description,
  loading,
  sips,
  onPause,
  onResume,
  onCancel,
}: SipListCardProps) {
  const columns: DataTableColumn<ActiveSip>[] = [
    {
      id: "scheme",
      header: "Scheme",
      sortValue: (r) => r.schemeName,
      accessor: (r) => (
        <div>
          <p className="font-medium">{r.schemeName}</p>
          <p className="text-xs text-muted-foreground">
            {r.amc} · Folio <span className="font-mono">{r.folioNumber}</span>
          </p>
        </div>
      ),
    },
    {
      id: "amount",
      header: "Amount",
      align: "right",
      sortValue: (r) => r.monthlyAmount,
      accessor: (r) => (
        <div className="text-right">
          <p className="font-semibold">{formatINR(r.monthlyAmount)}</p>
          <p className="text-xs capitalize text-muted-foreground">{r.frequency}</p>
        </div>
      ),
    },
    {
      id: "next",
      header: "Next debit",
      align: "right",
      sortValue: (r) => +new Date(r.nextInstallmentDate),
      accessor: (r) =>
        r.status === "active" || r.status === "paused" ? formatDate(r.nextInstallmentDate) : "—",
    },
    {
      id: "progress",
      header: "Installments",
      align: "right",
      sortValue: (r) => r.installmentsDone,
      accessor: (r) => (
        <span className="tabular-nums">
          {r.installmentsDone}
          {r.totalInstallments ? ` / ${r.totalInstallments}` : " / ∞"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      sortValue: (r) => r.status,
      accessor: (r) => <StatusBadge tone={STATUS_TONE[r.status]} label={STATUS_LABEL[r.status]} />,
    },
    {
      id: "actions",
      header: "",
      align: "right",
      accessor: (r) => (
        <div className="flex justify-end gap-1.5">
          {onPause && r.status === "active" && (
            <Button size="sm" variant="outline" onClick={() => onPause(r.id)} className="gap-1.5">
              <Pause className="h-3.5 w-3.5" /> Pause
            </Button>
          )}
          {onResume && r.status === "paused" && (
            <Button size="sm" variant="outline" onClick={() => onResume(r.id)} className="gap-1.5">
              <Play className="h-3.5 w-3.5" /> Resume
            </Button>
          )}
          {onCancel && (r.status === "active" || r.status === "paused") && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onCancel(r.id)}
              className="gap-1.5 text-destructive hover:text-destructive"
            >
              <X className="h-3.5 w-3.5" /> Cancel
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <ChartSkeleton height={200} />
        ) : (
          <DataTable
            columns={columns}
            data={sips}
            initialSortId="next"
            initialSortDir="asc"
            mobileCard={(r) => (
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold">{r.schemeName}</p>
                  <StatusBadge tone={STATUS_TONE[r.status]} label={STATUS_LABEL[r.status]} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {r.amc} · Folio <span className="font-mono">{r.folioNumber}</span>
                </p>
                <div className="flex items-end justify-between pt-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Monthly
                    </p>
                    <p className="font-semibold tabular-nums">{formatINR(r.monthlyAmount)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Next debit
                    </p>
                    <p className="text-sm">{formatDate(r.nextInstallmentDate)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap justify-end gap-1.5 pt-2">
                  {onPause && r.status === "active" && (
                    <Button size="sm" variant="outline" onClick={() => onPause(r.id)} className="gap-1.5">
                      <Pause className="h-3.5 w-3.5" /> Pause
                    </Button>
                  )}
                  {onResume && r.status === "paused" && (
                    <Button size="sm" variant="outline" onClick={() => onResume(r.id)} className="gap-1.5">
                      <Play className="h-3.5 w-3.5" /> Resume
                    </Button>
                  )}
                  {onCancel && (r.status === "active" || r.status === "paused") && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onCancel(r.id)}
                      className="gap-1.5 text-destructive"
                    >
                      <X className="h-3.5 w-3.5" /> Cancel
                    </Button>
                  )}
                </div>
              </div>
            )}
            emptyState={
              <div className="space-y-1">
                <p className="text-sm font-medium">No SIPs in this category</p>
                <p className="text-xs text-muted-foreground">
                  Start a new SIP from the button above.
                </p>
              </div>
            }
          />
        )}
      </CardContent>
    </Card>
  );
}

function UpcomingPanel({
  loading,
  items,
}: {
  loading: boolean;
  items: UpcomingInstallment[];
}) {
  const grouped = useMemo(() => {
    const map = new Map<string, UpcomingInstallment[]>();
    const sorted = [...items].sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate));
    for (const i of sorted) {
      const k = new Date(i.dueDate).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      });
      const arr = map.get(k) ?? [];
      arr.push(i);
      map.set(k, arr);
    }
    return Array.from(map.entries());
  }, [items]);

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Upcoming installments</CardTitle>
        <CardDescription>Auto-debit schedule across all your active SIPs.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <ChartSkeleton height={180} />
        ) : grouped.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming installments.</p>
        ) : (
          grouped.map(([month, list]) => {
            const total = list.reduce((sum, i) => sum + i.amount, 0);
            return (
              <div key={month} className="space-y-2">
                <div className="flex items-end justify-between border-b border-border pb-1.5">
                  <p className="text-sm font-semibold">{month}</p>
                  <p className="text-xs text-muted-foreground">
                    Total{" "}
                    <span className="font-semibold text-foreground tabular-nums">
                      {formatINR(total)}
                    </span>
                  </p>
                </div>
                <ul className="divide-y divide-border">
                  {list.map((i) => (
                    <li key={i.id} className="flex items-center justify-between gap-3 py-2.5">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary text-foreground/80">
                          <TrendingUp className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{i.schemeName}</p>
                          <p className="text-xs text-muted-foreground">
                            {i.amc} · {formatDate(i.dueDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold tabular-nums">{formatINR(i.amount)}</span>
                        <StatusBadge
                          tone={INSTALLMENT_TONE[i.status]}
                          label={INSTALLMENT_LABEL[i.status]}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

// Suppress unused import warning; Loader2 reserved for future inline spinners.
void Loader2;
