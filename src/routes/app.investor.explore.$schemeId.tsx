import { useMemo } from "react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Repeat2,
  ShieldCheck,
  Star,
  TrendingUp,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChartSkeleton } from "@/components/feedback/skeletons";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useSchemeQuery } from "@/features/schemes/api";
import { useAuthStore } from "@/stores/auth-store";
import { ROLE_HOME } from "@/features/auth/role-routes";
import { formatCompactINR, formatPercent, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Scheme } from "@/types/scheme";

export const Route = createFileRoute("/app/investor/explore/$schemeId")({
  beforeLoad: () => {
    const { user } = useAuthStore.getState();
    if (user && user.role !== "investor") throw redirect({ to: ROLE_HOME[user.role] });
  },
  head: () => ({ meta: [{ title: "Scheme details — BuyBestFin" }] }),
  component: SchemeDetailPage,
});

const RISK_LABEL: Record<Scheme["risk"], string> = {
  low: "Low",
  moderate: "Moderate",
  moderately_high: "Mod-High",
  high: "High",
  very_high: "Very High",
};

const RISK_TONE: Record<Scheme["risk"], string> = {
  low: "bg-success/12 text-success",
  moderate: "bg-info/12 text-info",
  moderately_high: "bg-warning/15 text-warning",
  high: "bg-warning/20 text-warning",
  very_high: "bg-destructive/12 text-destructive",
};

function SchemeDetailPage() {
  const { schemeId } = Route.useParams();
  const { data: scheme, isLoading } = useSchemeQuery(schemeId);

  const navHistory = useMemo(() => buildNavHistory(scheme), [scheme]);
  const allocation = useMemo(() => buildAllocation(scheme), [scheme]);

  if (!isLoading && !scheme) {
    return (
      <>
        <PageHeader eyebrow="Explore" title="Scheme not found" description="This fund may have been delisted." />
        <div className="px-6 py-6 sm:px-8">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/app/investor/explore">
              <ArrowLeft className="h-4 w-4" /> Back to explore
            </Link>
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Explore"
        title={scheme?.schemeName ?? "Loading…"}
        description={scheme ? `${scheme.amc} · ${scheme.category}` : ""}
        actions={
          scheme ? (
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" className="gap-2">
                <Link to="/app/investor/explore">
                  <ArrowLeft className="h-4 w-4" /> Explore
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link to="/app/investor/orders/sip" search={{ schemeId: scheme.id }}>
                  <Repeat2 className="h-4 w-4" /> Start SIP
                </Link>
              </Button>
              <Button asChild className="gap-2">
                <Link to="/app/investor/orders/lumpsum" search={{ schemeId: scheme.id }}>
                  Invest now <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : null
        }
      />

      <div className="space-y-6 px-6 py-6 sm:px-8">
        {isLoading || !scheme ? (
          <Card className="shadow-card">
            <CardContent className="p-6">
              <ChartSkeleton height={400} />
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Hero stats */}
            <Card className="overflow-hidden shadow-card">
              <CardContent className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-5">
                <HeroStat label="NAV" value={`₹${scheme.nav.toFixed(2)}`} sub={`as of ${formatDate(scheme.navAsOf)}`} />
                <HeroStat label="1Y return" value={formatPercent(scheme.return1y, 1)} positive />
                <HeroStat label="3Y CAGR" value={formatPercent(scheme.return3y, 1)} positive />
                <HeroStat
                  label="Rating"
                  value={`${scheme.rating}/5`}
                  icon={<Star className="h-3.5 w-3.5 fill-warning text-warning" />}
                />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Risk</p>
                  <Badge variant="secondary" className={cn("mt-2 border-0 font-medium", RISK_TONE[scheme.risk])}>
                    {RISK_LABEL[scheme.risk]}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* NAV chart */}
              <Card className="shadow-card lg:col-span-2">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>NAV trend</CardTitle>
                      <CardDescription>Last 12 months · indicative chart.</CardDescription>
                    </div>
                    <Badge variant="secondary" className="border-0 bg-secondary text-foreground">
                      <CalendarDays className="mr-1 h-3 w-3" /> {formatDate(scheme.navAsOf)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="px-2 pb-4 sm:px-4">
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={navHistory} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="schemeNav" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="2 4" stroke="var(--color-border)" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(v) => new Date(v).toLocaleDateString("en-IN", { month: "short" })}
                        stroke="var(--color-muted-foreground)"
                        tickLine={false}
                        axisLine={false}
                        fontSize={11}
                        minTickGap={16}
                      />
                      <YAxis
                        domain={["dataMin - 5", "dataMax + 5"]}
                        tickFormatter={(v) => `₹${Number(v).toFixed(0)}`}
                        stroke="var(--color-muted-foreground)"
                        tickLine={false}
                        axisLine={false}
                        fontSize={11}
                        width={56}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "var(--color-popover)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                        formatter={(value) => [`₹${Number(value).toFixed(2)}`, "NAV"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="nav"
                        stroke="var(--color-primary)"
                        strokeWidth={2.4}
                        fill="url(#schemeNav)"
                        activeDot={{ r: 4, strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Allocation donut */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Asset allocation</CardTitle>
                  <CardDescription>Indicative — based on category.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={allocation}
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                      >
                        {allocation.map((entry, i) => (
                          <Cell key={entry.name} fill={`var(--chart-${(i % 5) + 1})`} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "var(--color-popover)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                        formatter={(v) => [`${v}%`, ""]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 space-y-1.5">
                    {allocation.map((a, i) => (
                      <div key={a.name} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ background: `var(--chart-${(i % 5) + 1})` }}
                          />
                          {a.name}
                        </span>
                        <span className="font-semibold tabular-nums">{a.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Key facts */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Key facts</CardTitle>
                <CardDescription>Snapshot of fundamentals and costs.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-x-8 gap-y-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                <Fact label="AUM" value={formatCompactINR(scheme.aumCr * 1e7)} />
                <Fact label="Expense ratio" value={`${scheme.expenseRatio}%`} />
                <Fact label="Min lumpsum" value={`₹${scheme.minLumpsum.toLocaleString("en-IN")}`} />
                <Fact label="Min SIP" value={`₹${scheme.minSip.toLocaleString("en-IN")}`} />
                <Fact label="Asset class" value={scheme.assetClass} capitalize />
                <Fact label="Category" value={scheme.category} />
                <Fact label="5Y return" value={scheme.return5y > 0 ? formatPercent(scheme.return5y, 1) : "—"} />
                <Fact label="Scheme code" value={scheme.schemeCode} mono />
                <Fact label="Benchmark" value="NIFTY 500 TRI" />
                <Fact label="Fund manager" value="Senior Fund Manager (3+ yrs)" />
                <Fact label="Exit load" value="1% if redeemed within 1 year" />
                <Fact label="Lock-in" value={scheme.category === "ELSS" ? "3 years" : "None"} />
              </CardContent>
            </Card>

            {/* Disclaimer + CTAs */}
            <Card className="border-dashed shadow-card">
              <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-start gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                  Mutual fund investments are subject to market risks. Read all scheme-related documents carefully.
                </p>
                <div className="flex shrink-0 gap-2">
                  <Button asChild variant="outline" className="gap-1.5">
                    <Link to="/app/investor/orders/sip" search={{ schemeId: scheme.id }}>
                      <Repeat2 className="h-3.5 w-3.5" /> Start SIP
                    </Link>
                  </Button>
                  <Button asChild className="gap-1.5">
                    <Link to="/app/investor/orders/lumpsum" search={{ schemeId: scheme.id }}>
                      <TrendingUp className="h-3.5 w-3.5" /> Invest now
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  );
}

function HeroStat({
  label,
  value,
  sub,
  positive,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-2 flex items-center gap-1.5 font-display text-2xl font-bold tabular-nums",
          positive && "text-profit",
        )}
      >
        {icon}
        {value}
      </p>
      {sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

function Fact({
  label,
  value,
  mono,
  capitalize,
}: {
  label: string;
  value: string;
  mono?: boolean;
  capitalize?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-sm font-semibold", mono && "font-mono", capitalize && "capitalize")}>{value}</p>
    </div>
  );
}

/** Pseudo NAV history derived from current NAV + return profile. */
function buildNavHistory(scheme?: Scheme): Array<{ date: string; nav: number }> {
  if (!scheme) return [];
  const months = 12;
  const end = scheme.nav;
  const start = end / (1 + scheme.return1y / 100);
  const seed = scheme.id.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  let r = seed;
  const result: Array<{ date: string; nav: number }> = [];
  const today = new Date();
  for (let i = months; i >= 0; i--) {
    const t = (months - i) / months;
    r = (r * 9301 + 49297) % 233280;
    const noise = ((r / 233280) - 0.5) * (Math.abs(end - start) * 0.18 + Math.max(end * 0.01, 0.5));
    const nav = start + (end - start) * t + noise;
    const d = new Date(today);
    d.setMonth(d.getMonth() - i);
    result.push({ date: d.toISOString().slice(0, 10), nav: Math.max(nav, 0.5) });
  }
  return result;
}

/** Indicative allocation derived from asset class. */
function buildAllocation(scheme?: Scheme): Array<{ name: string; value: number }> {
  if (!scheme) return [];
  switch (scheme.assetClass) {
    case "equity":
      return [
        { name: "Equity", value: 92 },
        { name: "Debt", value: 4 },
        { name: "Cash", value: 4 },
      ];
    case "debt":
      return [
        { name: "G-Sec", value: 38 },
        { name: "Corp bond", value: 48 },
        { name: "Cash", value: 14 },
      ];
    case "hybrid":
      return [
        { name: "Equity", value: 65 },
        { name: "Debt", value: 28 },
        { name: "Cash", value: 7 },
      ];
    case "gold":
      return [
        { name: "Gold", value: 96 },
        { name: "Cash", value: 4 },
      ];
    case "international":
      return [
        { name: "US equity", value: 78 },
        { name: "Cash", value: 12 },
        { name: "Other", value: 10 },
      ];
    default:
      return [{ name: "Mixed", value: 100 }];
  }
}
