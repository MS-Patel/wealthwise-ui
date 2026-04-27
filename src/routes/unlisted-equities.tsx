import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Rocket } from "lucide-react";

import { ComplianceFooter } from "@/components/layout/compliance-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingPageHeader } from "@/components/marketing/marketing-page-header";
import { FloatingActions } from "@/components/marketing/floating-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const WHATSAPP = "https://wa.me/917265098822?text=Hi";

export const Route = createFileRoute("/unlisted-equities")({
  head: () => ({
    meta: [
      { title: "Unlisted Equities — Pre-IPO Investing | BuyBestFin" },
      {
        name: "description",
        content:
          "Invest in pre-IPO shares of high-growth Indian companies before they go public. Curated unlisted equity opportunities by BuyBestFin.",
      },
      { property: "og:title", content: "Unlisted Equities — Pre-IPO Investing | BuyBestFin" },
      {
        property: "og:description",
        content: "Pre-IPO shares of top Indian startups and enterprises, curated by experts.",
      },
    ],
  }),
  component: UnlistedEquitiesPage,
});

const COMPANIES = [
  { name: "NSE", sector: "Exchange", ltp: "3,950", lot: 100 },
  { name: "Tata Capital", sector: "NBFC", ltp: "920", lot: 200 },
  { name: "OYO Hotels", sector: "Hospitality", ltp: "62", lot: 1000 },
  { name: "Reliance Retail", sector: "Retail", ltp: "1,560", lot: 100 },
  { name: "Chennai Super Kings", sector: "Sports", ltp: "175", lot: 500 },
  { name: "API Holdings (PharmEasy)", sector: "HealthTech", ltp: "9.50", lot: 5000 },
];

function UnlistedEquitiesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />
      <main className="flex-1">
        <MarketingPageHeader
          eyebrow="Unlisted Equities"
          title="Get in early — invest in pre-IPO companies"
          subtitle="Access shares of high-growth Indian companies before they list on the exchanges. Curated, expert-vetted, and serviced end-to-end."
        />

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COMPANIES.map((c) => (
              <article
                key={c.name}
                className="rounded-2xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-elegant"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge variant="secondary" className="rounded-full text-[11px]">{c.sector}</Badge>
                    <h3 className="mt-3 text-lg font-semibold leading-snug">{c.name}</h3>
                  </div>
                  <div className="grid h-10 w-10 place-items-center rounded-xl gradient-brand text-primary-foreground shadow-glow">
                    <Rocket className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-secondary p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Last traded
                    </p>
                    <p className="mt-1 font-display text-lg font-bold tabular-nums">₹{c.ltp}</p>
                  </div>
                  <div className="rounded-xl bg-secondary p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Min lot
                    </p>
                    <p className="mt-1 font-display text-lg font-bold tabular-nums">{c.lot}</p>
                  </div>
                </div>

                <Button asChild size="sm" className="mt-4 w-full gradient-brand text-primary-foreground">
                  <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">
                    Enquire on WhatsApp
                  </a>
                </Button>
              </article>
            ))}
          </div>

          {/* Risk callout */}
          <div className="mt-10 flex items-start gap-3 rounded-2xl border border-warning/40 bg-warning/5 p-6">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
            <div className="text-sm">
              <p className="font-semibold text-foreground">Important risk disclosure</p>
              <p className="mt-1 text-muted-foreground">
                Unlisted equity investments are illiquid, may be subject to lock-ins, and carry
                substantial risk of capital loss. Past performance is not indicative of future
                returns. Please consult your advisor and read all available documentation before
                investing. Indicative prices shown for illustration only.
              </p>
            </div>
          </div>
        </section>
      </main>
      <ComplianceFooter />
      <FloatingActions />
    </div>
  );
}
