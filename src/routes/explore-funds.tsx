import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";

import { ComplianceFooter } from "@/components/layout/compliance-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingPageHeader } from "@/components/marketing/marketing-page-header";
import { FloatingActions } from "@/components/marketing/floating-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/explore-funds")({
  head: () => ({
    meta: [
      { title: "Explore Funds — BuyBestFin" },
      {
        name: "description",
        content:
          "Discover top-rated mutual fund schemes across categories and AMCs. Filter, compare, and invest in seconds with BuyBestFin.",
      },
      { property: "og:title", content: "Explore Funds — BuyBestFin" },
      {
        property: "og:description",
        content: "Browse 5000+ mutual fund schemes across equity, debt, hybrid and more.",
      },
    ],
  }),
  component: ExploreFundsPage,
});

const FUNDS = [
  { name: "Parag Parikh Flexi Cap", category: "Flexi Cap", aum: "₹76,420 Cr", r3y: 24.6 },
  { name: "Mirae Asset Midcap", category: "Mid Cap", aum: "₹15,840 Cr", r3y: 31.2 },
  { name: "HDFC Corporate Bond", category: "Corporate Bond", aum: "₹29,140 Cr", r3y: 7.8 },
  { name: "Quant Small Cap", category: "Small Cap", aum: "₹22,055 Cr", r3y: 38.5 },
  { name: "Axis Bluechip", category: "Large Cap", aum: "₹34,720 Cr", r3y: 15.4 },
  { name: "ICICI Prudential Balanced Advantage", category: "Hybrid", aum: "₹56,210 Cr", r3y: 14.2 },
  { name: "SBI Magnum Gilt", category: "Gilt", aum: "₹9,840 Cr", r3y: 6.9 },
  { name: "Nippon India Liquid", category: "Liquid", aum: "₹31,420 Cr", r3y: 6.2 },
  { name: "Kotak Equity Opportunities", category: "Large & Mid Cap", aum: "₹24,180 Cr", r3y: 22.1 },
];

function ExploreFundsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />
      <main className="flex-1">
        <MarketingPageHeader
          eyebrow="Explore Funds"
          title="Find the right scheme for your goals"
          subtitle="Browse 5000+ mutual fund schemes across equity, debt, hybrid and more — backed by research and curated by experts."
        />

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          {/* Filters */}
          <div className="grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-card sm:grid-cols-[1fr_180px_180px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by scheme name…" className="pl-9" />
            </div>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                <SelectItem value="equity">Equity</SelectItem>
                <SelectItem value="debt">Debt</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="liquid">Liquid</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="AMC" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All AMCs</SelectItem>
                <SelectItem value="hdfc">HDFC</SelectItem>
                <SelectItem value="sbi">SBI</SelectItem>
                <SelectItem value="icici">ICICI Prudential</SelectItem>
                <SelectItem value="axis">Axis</SelectItem>
                <SelectItem value="mirae">Mirae Asset</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fund grid */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FUNDS.map((f) => (
              <article
                key={f.name}
                className="rounded-2xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-elegant"
              >
                <Badge variant="secondary" className="mb-3 rounded-full text-[11px]">
                  {f.category}
                </Badge>
                <h3 className="text-base font-semibold leading-snug">{f.name}</h3>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-secondary p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      3Y Return
                    </p>
                    <p className="mt-1 font-display text-lg font-bold tabular-nums text-profit">
                      {f.r3y.toFixed(1)}%
                    </p>
                  </div>
                  <div className="rounded-xl bg-secondary p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      AUM
                    </p>
                    <p className="mt-1 font-display text-lg font-bold tabular-nums">{f.aum}</p>
                  </div>
                </div>

                <Button asChild size="sm" className="mt-4 w-full gradient-brand text-primary-foreground">
                  <Link to="/login">Invest now</Link>
                </Button>
              </article>
            ))}
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Returns shown are illustrative. Mutual fund investments are subject to market risks.
          </p>
        </section>
      </main>
      <ComplianceFooter />
      <FloatingActions />
    </div>
  );
}
