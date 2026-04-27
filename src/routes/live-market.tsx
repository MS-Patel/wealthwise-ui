import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, Info } from "lucide-react";

import { ComplianceFooter } from "@/components/layout/compliance-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingPageHeader } from "@/components/marketing/marketing-page-header";
import { FloatingActions } from "@/components/marketing/floating-actions";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/live-market")({
  head: () => ({
    meta: [
      { title: "Live Market — BuyBestFin" },
      {
        name: "description",
        content:
          "Track headline Indian indices and the most active gainers and losers. Talk to your BuyBestFin advisor for real-time quotes.",
      },
      { property: "og:title", content: "Live Market — BuyBestFin" },
      {
        property: "og:description",
        content: "NIFTY, SENSEX, BANK NIFTY snapshots and top gainers / losers.",
      },
    ],
  }),
  component: LiveMarketPage,
});

const INDICES = [
  { name: "NIFTY 50", value: "24,567.85", change: 132.4, pct: 0.54 },
  { name: "SENSEX", value: "80,892.40", change: 412.18, pct: 0.51 },
  { name: "BANK NIFTY", value: "52,344.20", change: -98.65, pct: -0.19 },
  { name: "NIFTY MIDCAP 100", value: "58,920.10", change: 287.55, pct: 0.49 },
];

const GAINERS = [
  { sym: "RELIANCE", price: "2,945.20", pct: 3.42 },
  { sym: "INFY", price: "1,812.55", pct: 2.81 },
  { sym: "TCS", price: "4,212.30", pct: 2.45 },
  { sym: "ITC", price: "486.90", pct: 1.97 },
  { sym: "HDFCBANK", price: "1,648.10", pct: 1.62 },
];

const LOSERS = [
  { sym: "BAJFINANCE", price: "6,820.50", pct: -2.41 },
  { sym: "ASIANPAINT", price: "2,748.20", pct: -1.86 },
  { sym: "MARUTI", price: "11,920.40", pct: -1.42 },
  { sym: "HINDUNILVR", price: "2,442.80", pct: -1.28 },
  { sym: "AXISBANK", price: "1,128.55", pct: -0.95 },
];

function LiveMarketPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />
      <main className="flex-1">
        <MarketingPageHeader
          eyebrow="Live Market"
          title="Indian markets at a glance"
          subtitle="Headline indices and the most active movers. Illustrative snapshot — talk to your advisor for real-time quotes."
        />

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          {/* Indices */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {INDICES.map((i) => {
              const positive = i.change >= 0;
              return (
                <div key={i.name} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {i.name}
                  </p>
                  <p className="mt-2 font-display text-2xl font-bold tabular-nums">{i.value}</p>
                  <div
                    className={cn(
                      "mt-1 inline-flex items-center gap-1 text-sm font-semibold tabular-nums",
                      positive ? "text-profit" : "text-loss",
                    )}
                  >
                    {positive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    {positive ? "+" : ""}
                    {i.change.toFixed(2)} ({positive ? "+" : ""}
                    {i.pct.toFixed(2)}%)
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gainers / Losers */}
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <MoversCard title="Top Gainers" rows={GAINERS} positive />
            <MoversCard title="Top Losers" rows={LOSERS} positive={false} />
          </div>

          {/* Banner */}
          <div className="mt-10 flex flex-col items-start gap-3 rounded-2xl border border-border bg-info/5 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-info" />
              <div>
                <p className="text-sm font-semibold">Live data integration coming soon</p>
                <p className="text-xs text-muted-foreground">
                  Talk to your BuyBestFin advisor for real-time quotes and order execution.
                </p>
              </div>
            </div>
            <Badge className="gradient-brand text-primary-foreground">Beta preview</Badge>
          </div>
        </section>
      </main>
      <ComplianceFooter />
      <FloatingActions />
    </div>
  );
}

function MoversCard({
  title,
  rows,
  positive,
}: {
  title: string;
  rows: Array<{ sym: string; price: string; pct: number }>;
  positive: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">{title}</h3>
        <span className={cn("text-[11px] font-semibold uppercase tracking-wider", positive ? "text-profit" : "text-loss")}>
          NSE · today
        </span>
      </div>
      <div className="mt-4 divide-y divide-border">
        {rows.map((r) => (
          <div key={r.sym} className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-semibold">{r.sym}</p>
              <p className="text-xs text-muted-foreground">NSE</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold tabular-nums">₹{r.price}</p>
              <p className={cn("text-xs font-semibold tabular-nums", positive ? "text-profit" : "text-loss")}>
                {positive ? "+" : ""}
                {r.pct.toFixed(2)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
