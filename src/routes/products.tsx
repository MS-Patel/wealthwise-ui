import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Briefcase,
  Building2,
  IndianRupee,
  Landmark,
  Rocket,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ComplianceFooter } from "@/components/layout/compliance-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingPageHeader } from "@/components/marketing/marketing-page-header";
import { FloatingActions } from "@/components/marketing/floating-actions";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Our Products — BuyBestFin" },
      {
        name: "description",
        content:
          "Explore the full range of BuyBestFin investment products: mutual funds, listed & unlisted equities, bonds, corporate FDs and portfolio management.",
      },
      { property: "og:title", content: "Our Products — BuyBestFin" },
      {
        property: "og:description",
        content: "Mutual funds, equities, bonds, corporate FDs and more — all in one platform.",
      },
    ],
  }),
  component: ProductsPage,
});

const PRODUCTS = [
  {
    icon: TrendingUp,
    title: "Mutual Funds",
    description:
      "Invest in top-performing mutual funds via SIP or Lumpsum. Access 5000+ schemes across equity, debt, and hybrid categories from all major AMCs.",
    chips: ["SIP Starting ₹500", "All AMC Schemes", "Goal-Based Planning"],
  },
  {
    icon: Rocket,
    title: "Unlisted Equities",
    description:
      "Get early access to high-growth companies before they go public. Pre-IPO shares of top Indian startups and enterprises.",
    chips: ["Pre-IPO Shares", "High Growth Potential", "Expert Curation"],
  },
  {
    icon: IndianRupee,
    title: "Listed Equities",
    description:
      "Build a strong equity portfolio with direct stock investments. Research-backed recommendations for long-term wealth creation.",
    chips: ["Research Backed", "Portfolio Advisory", "Long Term Growth"],
  },
  {
    icon: Landmark,
    title: "Bonds",
    description:
      "Invest in government and corporate bonds for stable, predictable returns. Ideal for conservative investors seeking regular income.",
    chips: ["Govt & Corporate", "Regular Income", "Capital Safety"],
  },
  {
    icon: Building2,
    title: "Corporate FDs",
    description:
      "Earn higher interest rates compared to bank FDs with AAA-rated corporate fixed deposits. Safe and secure investment option.",
    chips: ["Higher Returns", "AAA Rated", "Flexible Tenure"],
  },
  {
    icon: Briefcase,
    title: "Portfolio Management",
    description:
      "Comprehensive portfolio review and rebalancing services. We help optimize your asset allocation for maximum risk-adjusted returns.",
    chips: ["Asset Allocation", "Regular Rebalancing", "Risk Management"],
  },
];

function ProductsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />
      <main className="flex-1">
        <MarketingPageHeader
          eyebrow="Our Products"
          title="Complete Investment Solutions"
          subtitle="From mutual funds to unlisted equities, we offer a comprehensive range of investment products tailored to your financial goals."
        />

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCTS.map((s) => (
              <article
                key={s.title}
                className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-elegant"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl gradient-brand text-primary-foreground shadow-glow">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {s.chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-14 rounded-3xl border border-border bg-card p-8 shadow-card sm:p-12">
            <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                  Open your account in <span className="gradient-text-brand">3 minutes</span>.
                </h2>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                  100% paperless KYC. Start your first SIP from ₹500/month. No hidden charges, ever.
                </p>
              </div>
              <Button asChild size="lg" className="gap-2 gradient-brand text-primary-foreground shadow-glow">
                <Link to="/signup">
                  Get started <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <ComplianceFooter />
      <FloatingActions />
    </div>
  );
}
