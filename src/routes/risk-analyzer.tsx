import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { ComplianceFooter } from "@/components/layout/compliance-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingPageHeader } from "@/components/marketing/marketing-page-header";
import { FloatingActions } from "@/components/marketing/floating-actions";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/risk-analyzer")({
  head: () => ({
    meta: [
      { title: "Risk Analyzer — Discover your investor profile | BuyBestFin" },
      {
        name: "description",
        content:
          "Take a 2-minute quiz to discover your risk profile and get a suggested asset allocation across equity, debt and gold.",
      },
      { property: "og:title", content: "Risk Analyzer — BuyBestFin" },
      {
        property: "og:description",
        content: "A 2-minute quiz to find your investor profile and ideal allocation.",
      },
    ],
  }),
  component: RiskAnalyzerPage,
});

interface Question {
  id: keyof FormValues;
  question: string;
  options: { label: string; score: number }[];
}

const QUESTIONS: Question[] = [
  {
    id: "horizon",
    question: "How long do you plan to stay invested?",
    options: [
      { label: "Less than 1 year", score: 1 },
      { label: "1–3 years", score: 2 },
      { label: "3–7 years", score: 3 },
      { label: "More than 7 years", score: 4 },
    ],
  },
  {
    id: "reaction",
    question: "If your portfolio dropped 20% in a month, you would…",
    options: [
      { label: "Sell everything immediately", score: 1 },
      { label: "Sell some to reduce risk", score: 2 },
      { label: "Hold and wait it out", score: 3 },
      { label: "Buy more at lower prices", score: 4 },
    ],
  },
  {
    id: "income",
    question: "What part of your monthly income goes into investments?",
    options: [
      { label: "Less than 5%", score: 1 },
      { label: "5–15%", score: 2 },
      { label: "15–30%", score: 3 },
      { label: "More than 30%", score: 4 },
    ],
  },
  {
    id: "experience",
    question: "How experienced are you with market-linked investments?",
    options: [
      { label: "First-time investor", score: 1 },
      { label: "1–3 years experience", score: 2 },
      { label: "3–7 years experience", score: 3 },
      { label: "More than 7 years", score: 4 },
    ],
  },
  {
    id: "goal",
    question: "What is your primary investment goal?",
    options: [
      { label: "Capital protection", score: 1 },
      { label: "Regular income", score: 2 },
      { label: "Balanced growth", score: 3 },
      { label: "Maximum long-term growth", score: 4 },
    ],
  },
  {
    id: "drawdown",
    question: "What's the largest one-year loss you can tolerate?",
    options: [
      { label: "0–5%", score: 1 },
      { label: "5–15%", score: 2 },
      { label: "15–25%", score: 3 },
      { label: "More than 25%", score: 4 },
    ],
  },
];

const schema = z.object({
  horizon: z.coerce.number().min(1).max(4),
  reaction: z.coerce.number().min(1).max(4),
  income: z.coerce.number().min(1).max(4),
  experience: z.coerce.number().min(1).max(4),
  goal: z.coerce.number().min(1).max(4),
  drawdown: z.coerce.number().min(1).max(4),
});
type FormValues = z.infer<typeof schema>;

interface Profile {
  bucket: "Conservative" | "Moderate" | "Aggressive";
  description: string;
  allocation: { equity: number; debt: number; gold: number };
}

function profileForScore(score: number): Profile {
  if (score <= 12) {
    return {
      bucket: "Conservative",
      description:
        "Capital preservation is your priority. You prefer steady, predictable returns and want to avoid sharp drawdowns.",
      allocation: { equity: 25, debt: 65, gold: 10 },
    };
  }
  if (score <= 18) {
    return {
      bucket: "Moderate",
      description:
        "You're comfortable with measured volatility in pursuit of long-term growth, balancing equity exposure with stable debt.",
      allocation: { equity: 55, debt: 35, gold: 10 },
    };
  }
  return {
    bucket: "Aggressive",
    description:
      "You have a long horizon and a high tolerance for short-term volatility, aiming to maximise long-term wealth creation.",
    allocation: { equity: 75, debt: 15, gold: 10 },
  };
}

function RiskAnalyzerPage() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
  });
  const [submitted, setSubmitted] = useState<FormValues | null>(null);

  const result = useMemo(() => {
    if (!submitted) return null;
    const score = Object.values(submitted).reduce<number>((a, b) => a + Number(b), 0);
    return { score, profile: profileForScore(score) };
  }, [submitted]);

  function onSubmit(data: FormValues) {
    setSubmitted(data);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: window.scrollY + 200, behavior: "smooth" });
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />
      <main className="flex-1">
        <MarketingPageHeader
          eyebrow="Risk Analyzer"
          title="Discover your investor profile in 2 minutes"
          subtitle="Answer 6 quick questions and we'll suggest the right asset allocation across equity, debt and gold for you."
        />

        <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {QUESTIONS.map((q, idx) => (
                <FormField
                  key={q.id}
                  control={form.control}
                  name={q.id}
                  render={({ field }) => (
                    <FormItem className="rounded-2xl border border-border bg-card p-5 shadow-card">
                      <FormLabel className="text-base font-semibold">
                        <span className="mr-2 text-accent">{idx + 1}.</span>
                        {q.question}
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={field.value ? String(field.value) : ""}
                          onValueChange={(v) => field.onChange(Number(v))}
                          className="mt-3 grid gap-2 sm:grid-cols-2"
                        >
                          {q.options.map((opt) => (
                            <label
                              key={opt.label}
                              className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-background p-3 text-sm transition-colors hover:bg-secondary has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                            >
                              <RadioGroupItem value={String(opt.score)} />
                              <span>{opt.label}</span>
                            </label>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              <Button type="submit" size="lg" className="w-full gradient-brand text-primary-foreground">
                Get my risk profile
              </Button>
            </form>
          </Form>

          {result && (
            <div className="mt-10 rounded-3xl border border-border bg-card p-7 shadow-elegant">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-accent" />
                <p className="text-xs font-semibold uppercase tracking-wider text-accent">Your profile</p>
              </div>
              <h3 className="mt-2 font-display text-3xl font-bold tracking-tight">
                {result.profile.bucket} Investor
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{result.profile.description}</p>

              <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Suggested allocation
              </p>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <AllocTile label="Equity" pct={result.profile.allocation.equity} />
                <AllocTile label="Debt" pct={result.profile.allocation.debt} />
                <AllocTile label="Gold" pct={result.profile.allocation.gold} />
              </div>

              <Button asChild size="lg" className="mt-6 w-full gradient-brand text-primary-foreground">
                <Link to="/signup">
                  Start building your portfolio <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </section>
      </main>
      <ComplianceFooter />
      <FloatingActions />
    </div>
  );
}

function AllocTile({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="rounded-2xl bg-secondary p-4 text-center">
      <p className="font-display text-2xl font-bold tabular-nums gradient-text-brand">{pct}%</p>
      <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
