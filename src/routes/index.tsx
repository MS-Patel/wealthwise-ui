import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Receipt, ShieldCheck, Sparkles, Target, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ComplianceFooter } from "@/components/layout/compliance-footer";
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
      { title: "BuyBestFin — Smart mutual fund investing" },
      {
        name: "description",
        content:
          "Invest in 1,500+ direct mutual funds, plan goals, and optimise tax — powered by Navinchandra Securities (ARN 147231).",
      },
      { property: "og:title", content: "BuyBestFin — Smart mutual fund investing" },
      {
        property: "og:description",
        content: "Direct mutual funds, goal planning, and tax-loss harvesting in one elegant platform.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <BrandLogo to="/" />
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm" className="gap-1.5">
              <Link to="/signup">
                Open account <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div aria-hidden className="absolute inset-0 gradient-hero" />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
            <div>
              <Badge variant="secondary" className="mb-5 rounded-full bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent">
                Direct mutual funds · Zero commission
              </Badge>
              <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Build wealth that{" "}
                <span className="gradient-text-brand">outlives the market</span>.
              </h1>
              <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
                BuyBestFin gives you BSE Star MF execution, goal-based planning, and tax-loss
                harvesting — backed by SEBI-registered Navinchandra Securities (ARN 147231).
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/signup">
                    Start investing <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/login">I already have an account</Link>
                </Button>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs font-medium text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-success" /> AMFI registered
                </span>
                <span>BSE Star MF · NDML KYC</span>
                <span>₹2,400 Cr+ AUM serviced</span>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-elegant">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Live portfolio
                    </p>
                    <p className="mt-1 font-display text-3xl font-bold tabular-nums">₹14,82,340</p>
                  </div>
                  <Badge variant="secondary" className="border-0 bg-success/12 text-success">
                    +18.4%
                  </Badge>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[
                    { label: "Equity", value: "62%", glow: true },
                    { label: "Debt", value: "24%" },
                    { label: "Gold", value: "14%" },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className={`rounded-xl border border-border p-3 ${s.glow ? "gradient-accent text-accent-foreground" : "bg-secondary"}`}
                    >
                      <p className={`text-[10px] font-semibold uppercase tracking-wider ${s.glow ? "text-accent-foreground/80" : "text-muted-foreground"}`}>
                        {s.label}
                      </p>
                      <p className="mt-1 font-display text-lg font-bold tabular-nums">{s.value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 space-y-3">
                  {[
                    { name: "Parag Parikh Flexi Cap", change: "+24.6%" },
                    { name: "Mirae Asset Midcap", change: "+31.2%" },
                    { name: "HDFC Corporate Bond", change: "+7.8%" },
                  ].map((f) => (
                    <div key={f.name} className="flex items-center justify-between text-sm">
                      <span className="truncate font-medium">{f.name}</span>
                      <span className="shrink-0 font-semibold tabular-nums text-profit">{f.change}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature strip */}
        <section className="border-y border-border bg-card/40">
          <div className="mx-auto grid max-w-7xl gap-6 px-6 py-14 sm:grid-cols-2 lg:grid-cols-3">
            <Feature
              icon={TrendingUp}
              title="Smart investing"
              description="Curated, top-rated direct funds across equity, debt, gold, and global. Lumpsum and SIP in 60 seconds."
            />
            <Feature
              icon={Target}
              title="Goal planning"
              description="Map every SIP to a life goal — house, retirement, education — and watch it move forward in real time."
            />
            <Feature
              icon={Receipt}
              title="Tax optimisation"
              description="Identify harvest opportunities, simulate STCG/LTCG, and use the ₹1L exemption every year."
            />
          </div>
        </section>

        {/* Stats / trust bar */}
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Stat icon={Sparkles} value="1,500+" label="Direct funds" />
            <Stat icon={ShieldCheck} value="₹2,400 Cr" label="AUM serviced" />
            <Stat icon={BarChart3} value="60s" label="Avg. order time" />
            <Stat icon={Target} value="22,000+" label="Active investors" />
          </div>

          <div className="mt-16 rounded-3xl border border-border bg-card p-8 shadow-card sm:p-12">
            <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                  Open your account in <span className="gradient-text-brand">3 minutes</span>.
                </h2>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                  100% paperless KYC via NDML. Start your first SIP from ₹100/month. No hidden charges, ever.
                </p>
              </div>
              <Button asChild size="lg" className="gap-2">
                <Link to="/signup">
                  Get started <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <ComplianceFooter />
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof TrendingUp;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-6 shadow-card transition-shadow hover:shadow-elegant">
      <div className="grid h-11 w-11 place-items-center rounded-xl gradient-brand text-primary-foreground shadow-glow">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof TrendingUp;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-card">
      <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-secondary text-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 font-display text-2xl font-bold tabular-nums">{value}</p>
      <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}
