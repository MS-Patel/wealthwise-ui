import { createFileRoute, redirect } from "@tanstack/react-router";
import { Activity, AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge, type StatusTone } from "@/components/feedback/status-badge";
import { useIntegrationsQuery } from "@/features/admin/api";
import { useAuthStore } from "@/stores/auth-store";
import { ROLE_HOME } from "@/features/auth/role-routes";
import { relativeTime } from "@/lib/relative-time";
import { cn } from "@/lib/utils";
import type { IntegrationStatus } from "@/types/admin";

export const Route = createFileRoute("/app/admin/system")({
  beforeLoad: () => {
    const { user } = useAuthStore.getState();
    if (user && user.role !== "admin") throw redirect({ to: ROLE_HOME[user.role] });
  },
  head: () => ({ meta: [{ title: "Integrations & logs — Admin" }] }),
  component: AdminSystemPage,
});

const STATUS_TONE: Record<IntegrationStatus, StatusTone> = {
  operational: "success",
  degraded: "warning",
  down: "destructive",
};

function AdminSystemPage() {
  const { data } = useIntegrationsQuery();
  const health = data?.health ?? [];
  const logs = data?.logs ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Admin · System"
        title="Integrations & logs"
        description="Live health for BSE Star MF, NDML, and RTA pipelines plus the recent event stream."
      />
      <div className="space-y-6 px-6 py-6 sm:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {health.map((h) => (
            <Card key={h.name} className="shadow-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="grid h-10 w-10 place-items-center rounded-xl gradient-brand text-primary-foreground shadow-glow">
                    <Activity className="h-4.5 w-4.5" />
                  </div>
                  <StatusBadge tone={STATUS_TONE[h.status]} label={h.status} />
                </div>
                <p className="mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">{h.name}</p>
                <p className="mt-1 font-display text-xl font-bold tabular-nums">{h.uptime.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">{h.latencyMs}ms · checked {relativeTime(h.lastCheck)}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Event stream</CardTitle>
            <CardDescription>Last 24 hours of integration activity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {logs.map((log) => {
              const Icon = log.level === "error" ? XCircle : log.level === "warn" ? AlertTriangle : log.level === "info" ? Info : CheckCircle2;
              return (
                <div
                  key={log.id}
                  className="flex items-start gap-3 rounded-lg border border-border bg-secondary/30 p-3"
                >
                  <Icon
                    className={cn(
                      "mt-0.5 h-4.5 w-4.5 shrink-0",
                      log.level === "error" && "text-destructive",
                      log.level === "warn" && "text-warning",
                      log.level === "info" && "text-info",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">{log.integration}</p>
                      <p className="text-xs text-muted-foreground">{relativeTime(log.at)}</p>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{log.message}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
