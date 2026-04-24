import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowUpRight,
  Building2,
  CalendarDays,
  Landmark,
  Repeat2,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChartSkeleton } from "@/components/feedback/skeletons";
import { StatusBadge } from "@/components/feedback/status-badge";
import { cn } from "@/lib/utils";
import { formatCompactINR, formatDate, formatINR, formatPercent } from "@/lib/format";

import { useFolioDetailQuery } from "@/features/portfolio/api";
import { useActiveSipsQuery } from "@/features/sips/api";
import { KYC_FIXTURE } from "@/features/kyc/fixtures";
import { useAuthStore } from "@/stores/auth-store";
import { ROLE_HOME } from "@/features/auth/role-routes";
import type { FolioRecentTxn, Holding } from "@/types/portfolio";

export const Route = createFileRoute("/app/investor/folios/$folioNumber")({
  beforeLoad: () => {
    const { user, isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) throw redirect({ to: "/login" });
    if (user && user.role !== "investor") throw redirect({ to: ROLE_HOME[user.role] });
  },
  head: () => ({ meta: [{ title: "Folio details — BuyBestFin" }] }),
  component: FolioDetailPage,
});

const TXN_TYPE_LABEL: Record<FolioRecentTxn["type"], string> = {
  purchase: "Purchase",
  sip: "SIP",
  redeem: "Redeem",
  switch_in: "Switch In",
  switch_out: "Switch Out",
  dividend: "Dividend",
};

function FolioDetailPage() {
  const { folioNumber } = Route.useParams();
  const { data: folio, isLoading } = useFolioDetailQuery(folioNumber);
  const { data: sips } = useActiveSipsQuery();

  if (!isLoading && !folio) {
    return (
      <>
        <PageHeader eyebrow="Portfolio" title="Folio not found" />
        <div className="px-6 py-6 sm:px-8">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/app/investor/portfolio">
              <ArrowLeft className="h-4 w-4" /> Back to portfolio
            </Link>
          </Button>
        </div>
      </>
    );
  }

  const linkedSips = (sips ?? []).filter((s) => folio?.linkedSipIds.includes(s.id));
  const bank = KYC_FIXTURE.bankAccounts.find((b) => b.id === folio?.linkedBankAccountId);
  const positive = (folio?.totalUnrealizedGain ?? 0) >= 0;

  return (
    <>
      <PageHeader
        eyebrow={folio ? `${folio.amc} · ${folio.registrar}` : "Portfolio"}
        title={folio ? `Folio ${folio.folioNumber}` : "Loading folio…"}
        description={folio ? `Opened on ${formatDate(folio.openedOn)}` : undefined}
        actions={
          <Button asChild variant="outline" className="gap-2">
            <Link to="/app/investor/portfolio">
              <ArrowLeft className="h-4 w-4" /> Portfolio
            </Link>
          </Button>
        }
      />

      <div className="space-y-6 px-6 py-6 sm:px-8">
        {isLoading || !folio ? (
          <Card className="shadow-card">
            <CardContent className="p-6">
              <ChartSkeleton height={400} />
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stat strip */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard label="Current value" value={formatCompactINR(folio.totalCurrentValue)} accent />
              <StatCard label="Invested" value={formatCompactINR(folio.totalInvested)} />
              <StatCard
                label="Unrealised gain"
                value={`${positive ? "+" : ""}${formatINR(Math.abs(folio.totalUnrealizedGain))}`}
                tone={positive ? "success" : "destructive"}
              />
              <StatCard
                label="Returns"
                value={formatPercent(folio.totalReturnPct)}
                tone={positive ? "success" : "destructive"}
              />
            </div>

            {/* Schemes table */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Schemes in this folio</CardTitle>
                <CardDescription>{folio.holdings.length} scheme(s) under {folio.amc}.</CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-y border-border bg-secondary/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                        <th className="px-6 py-2">Scheme</th>
                        <th className="px-6 py-2 text-right">Units</th>
                        <th className="px-6 py-2 text-right">Avg / Current NAV</th>
                        <th className="px-6 py-2 text-right">Invested</th>
                        <th className="px-6 py-2 text-right">Current value</th>
                        <th className="px-6 py-2 text-right">Returns</th>
                        <th className="px-6 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {folio.holdings.map((h) => (
                        <SchemeRow key={h.id} h={h} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Recent transactions */}
              <Card className="shadow-card lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recent transactions</CardTitle>
                  <CardDescription>Last {folio.recentTransactions.length} entries.</CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-4">
                  {folio.recentTransactions.length === 0 ? (
                    <p className="px-6 py-6 text-sm text-muted-foreground">No transactions yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-y border-border bg-secondary/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                            <th className="px-6 py-2">Date</th>
                            <th className="px-6 py-2">Type</th>
                            <th className="px-6 py-2 text-right">Amount</th>
                            <th className="px-6 py-2 text-right">Units</th>
                            <th className="px-6 py-2 text-right">NAV</th>
                            <th className="px-6 py-2">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {folio.recentTransactions.map((t) => (
                            <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                              <td className="px-6 py-3 font-medium">{formatDate(t.date)}</td>
                              <td className="px-6 py-3">{TXN_TYPE_LABEL[t.type]}</td>
                              <td className="px-6 py-3 text-right font-semibold tabular-nums">
                                {formatINR(t.amount)}
                              </td>
                              <td className="px-6 py-3 text-right tabular-nums text-muted-foreground">
                                {t.units.toFixed(3)}
                              </td>
                              <td className="px-6 py-3 text-right tabular-nums text-muted-foreground">
                                ₹{t.nav.toFixed(2)}
                              </td>
                              <td className="px-6 py-3">
                                <StatusBadge tone="success" label="Completed" />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Right rail: bank + nominees + linked sips */}
              <div className="space-y-6">
                <Card className="shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Landmark className="h-4 w-4 text-accent" /> Linked bank
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {bank ? (
                      <div>
                        <p className="font-semibold">{bank.bankName}</p>
                        <p className="font-mono text-xs text-muted-foreground">{bank.accountNumberMasked}</p>
                        <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                          {bank.accountType}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No bank linked.</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Users className="h-4 w-4 text-accent" /> Nominees
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {folio.nominees.map((n, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium">{n.name}</p>
                          <p className="text-xs text-muted-foreground">{n.relation}</p>
                        </div>
                        <Badge variant="secondary" className="border-0 bg-secondary tabular-nums">
                          {n.sharePct}%
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <CalendarDays className="h-4 w-4 text-accent" /> Linked SIPs
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {linkedSips.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No SIPs linked to this folio.</p>
                    ) : (
                      linkedSips.map((s) => (
                        <div key={s.id} className="rounded-lg border border-border bg-secondary/30 p-3">
                          <p className="text-sm font-medium">{s.schemeName}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {formatINR(s.monthlyAmount)} / month · next {formatDate(s.nextInstallmentDate)}
                          </p>
                        </div>
                      ))
                    )}
                    <Button asChild variant="outline" size="sm" className="w-full gap-1.5">
                      <Link to="/app/investor/sips">
                        <Wallet className="h-3.5 w-3.5" /> Manage SIPs
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function SchemeRow({ h }: { h: Holding }) {
  const positive = h.unrealizedGain >= 0;
  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/40">
      <td className="px-6 py-3">
        <Link
          to="/app/investor/portfolio/$holdingId"
          params={{ holdingId: h.id }}
          className="font-medium hover:text-accent"
        >
          {h.schemeName}
        </Link>
        <p className="text-xs text-muted-foreground">
          <Building2 className="mr-1 inline h-3 w-3" /> {h.category}
        </p>
      </td>
      <td className="px-6 py-3 text-right tabular-nums">{h.units.toLocaleString("en-IN", { maximumFractionDigits: 3 })}</td>
      <td className="px-6 py-3 text-right tabular-nums text-muted-foreground">
        ₹{h.avgNav.toFixed(2)} → <span className="font-medium text-foreground">₹{h.currentNav.toFixed(2)}</span>
      </td>
      <td className="px-6 py-3 text-right tabular-nums">{formatINR(h.invested)}</td>
      <td className="px-6 py-3 text-right font-semibold tabular-nums">{formatINR(h.currentValue)}</td>
      <td className={cn("px-6 py-3 text-right font-semibold tabular-nums", positive ? "text-success" : "text-destructive")}>
        {formatPercent(h.returnPct)}
      </td>
      <td className="px-6 py-3 text-right">
        <div className="flex justify-end gap-1.5">
          <Button asChild size="sm" variant="ghost" className="gap-1">
            <Link to="/app/investor/orders/lumpsum" search={{ schemeId: h.schemeCode }}>
              <ArrowUpRight className="h-3.5 w-3.5" /> Invest
            </Link>
          </Button>
          <Button asChild size="sm" variant="ghost" className="gap-1">
            <Link to="/app/investor/orders/redeem" search={{ holdingId: h.id }}>
              <ArrowDownToLine className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button asChild size="sm" variant="ghost" className="gap-1">
            <Link to="/app/investor/orders/switch" search={{ fromHoldingId: h.id }}>
              <Repeat2 className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </td>
    </tr>
  );
}

function StatCard({
  label,
  value,
  accent,
  tone,
}: {
  label: string;
  value: string;
  accent?: boolean;
  tone?: "success" | "destructive";
}) {
  return (
    <Card className="shadow-card">
      <CardContent className="p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p
          className={cn(
            "mt-1 font-display tabular-nums",
            accent ? "text-2xl font-bold" : "text-xl font-semibold",
            tone === "success" && "text-success",
            tone === "destructive" && "text-destructive",
          )}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

void TrendingUp;
