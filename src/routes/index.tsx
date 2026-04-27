import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Building2,
  CheckCircle2,
  IndianRupee,
  Landmark,
  Rocket,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ComplianceFooter } from "@/components/layout/compliance-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { FloatingActions } from "@/components/marketing/floating-actions";
import { useAuthStore } from "@/stores/auth-store";
import { ROLE_HOME } from "@/features/auth/role-routes";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const { isAuthenticated, user } = useAuthStore.getState();
    if (isAuthenticated && user) {
      throw redirect({ to: ROLE_HOME[user.role] });
    }
  },
  head: () => ({
    meta: [
      { title: "BuyBestFin — Grow Your Wealth with Smart Investments" },
      {
        name: "description",
        content:
          "AMFI Registered Mutual Fund Distributor (ARN: 147231). Invest in Mutual Funds, Equities, Bonds & Corporate FDs with Navinchandra Securities.",
      },
      { property: "og:title", content: "BuyBestFin — Grow Your Wealth with Smart Investments" },
      {
        property: "og:description",
        content:
          "Your trusted partner for Mutual Funds, Equities, Bonds & Corporate FDs. Build a diversified portfolio for long-term wealth.",
      },
    ],
  }),
  component: LandingPage,
});

const HERO_CARDS = [
  { icon: TrendingUp, title: "Mutual Funds", desc: "SIP & Lumpsum across top AMCs" },
  { icon: IndianRupee, title: "Listed Equities", desc: "Direct equity investments" },
  { icon: ShieldCheck, title: "Bonds", desc: "Government & Corporate bonds" },
  { icon: BarChart3, title: "Corporate FDs", desc: "High-yield fixed deposits" },
];

const SERVICES = [
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

const ABOUT_BULLETS = [
  "AMFI Registered MFD (ARN: 147231)",
  "Comprehensive range of investment products",
  "Personalized financial planning & advisory",
  "Transparent and client-first approach",
  "Technology-driven investment platform",
  "Dedicated support for customers & partners",
];

const ABOUT_STATS = [
  { value: "147231", label: "ARN Number" },
  { value: "500+", label: "Clients Served" },
  { value: "5000+", label: "MF Schemes" },
  { value: "24/7", label: "Online Access" },
];

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div aria-hidden className="absolute inset-0 gradient-hero" />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
            <div>
              <Badge
                variant="secondary"
                className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-info/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-info"
              >
                <ShieldCheck className="h-3.5 w-3.5" /> AMFI Registered Mutual Fund Distributor
              </Badge>
              <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Grow Your Wealth with{" "}
                <span className="gradient-text-brand">Smart Investments</span>
              </h1>
              <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
                Your trusted partner for Mutual Funds, Equities, Bonds & Corporate FDs. We help
                you build a diversified portfolio for long-term wealth creation.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="gap-2 gradient-brand text-primary-foreground shadow-glow">
                  <Link to="/login">
                    Start Investing <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="#services">Explore Services</a>
                </Button>
              </div>
              <div className="mt-12 grid max-w-lg grid-cols-3 gap-6 sm:gap-8">
                <HeroStat value="500+" label="Happy Clients" />
                <HeroStat value="₹50Cr+" label="AUM Managed" />
                <HeroStat value="10+" label="Years Experience" />
              </div>
            </div>

            <div className="relative grid grid-cols-2 gap-4 self-center">
              {HERO_CARDS.map((c) => (
                <div
                  key={c.title}
                  className="rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elegant"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-foreground">
                    <c.icon className="h-5 w-5 text-accent" />
                  </div>
                  <p className="mt-4 text-base font-semibold">{c.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="border-y border-border bg-card/40">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Our Services</p>
            <h2 className="mt-3 max-w-3xl font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Complete Investment Solutions
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              From mutual funds to unlisted equities, we offer a comprehensive range of investment
              products tailored to your financial goals.
            </p>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICES.map((s) => (
                <article
                  key={s.title}
                  className="group rounded-2xl border border-border bg-background p-6 shadow-card transition-shadow hover:shadow-elegant"
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
          </div>
        </section>

        {/* About */}
        <section id="about" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">About Us</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Your Trusted Financial Partner Since Day One
              </h2>
              <p className="mt-4 text-sm text-muted-foreground sm:text-base">
                BuyBestFin is an AMFI Registered Mutual Fund Distributor (ARN: 147231). We are
                committed to helping individuals and businesses achieve their financial goals
                through expert guidance and a wide range of investment products.
              </p>
              <ul className="mt-6 space-y-3">
                {ABOUT_BULLETS.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-border bg-card p-7 shadow-elegant">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                <p className="text-sm font-semibold">Why Choose Us?</p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">We go beyond just selling products</p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {ABOUT_STATS.map((s) => (
                  <div key={s.label} className="rounded-2xl bg-secondary p-4 text-center">
                    <p className="font-display text-2xl font-bold tabular-nums gradient-text-brand">
                      {s.value}
                    </p>
                    <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-[11px] italic text-muted-foreground">
                "Mutual Fund investments are subject to market risks. Please read all scheme
                related documents carefully before investing."
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

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-2xl font-bold tabular-nums gradient-text-brand sm:text-3xl">
        {value}
      </p>
      <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
