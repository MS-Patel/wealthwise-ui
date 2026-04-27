import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { ComplianceFooter } from "@/components/layout/compliance-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingPageHeader } from "@/components/marketing/marketing-page-header";
import { FloatingActions } from "@/components/marketing/floating-actions";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ResultChart } from "@/features/calculators/components/result-chart";
import { sipFutureValue, sipSeries } from "@/features/calculators/math";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/sip-calculator")({
  head: () => ({
    meta: [
      { title: "SIP Calculator — Plan your monthly investment | BuyBestFin" },
      {
        name: "description",
        content:
          "Estimate the future value of your SIP investment with BuyBestFin's free SIP calculator. Adjust monthly amount, expected returns and tenure.",
      },
      { property: "og:title", content: "SIP Calculator — BuyBestFin" },
      {
        property: "og:description",
        content: "Project your SIP returns instantly with our free calculator.",
      },
    ],
  }),
  component: SipCalculatorPage,
});

const schema = z.object({
  monthly: z.coerce.number().min(100, "Min ₹100").max(10_00_000, "Too large"),
  rate: z.coerce.number().min(1, "Min 1%").max(40, "Max 40%"),
  years: z.coerce.number().int().min(1, "Min 1 year").max(40, "Max 40 years"),
});
type FormValues = z.infer<typeof schema>;

function SipCalculatorPage() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { monthly: 5000, rate: 12, years: 15 },
    mode: "onChange",
  });

  const [values, setValues] = useState<FormValues>({ monthly: 5000, rate: 12, years: 15 });

  const computed = useMemo(() => {
    const fv = sipFutureValue(values.monthly, values.rate, values.years);
    const invested = values.monthly * 12 * values.years;
    const returns = Math.max(fv - invested, 0);
    const series = sipSeries(values.monthly, values.rate, values.years);
    return { fv, invested, returns, series };
  }, [values]);

  function onSubmit(data: FormValues) {
    setValues(data);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />
      <main className="flex-1">
        <MarketingPageHeader
          eyebrow="SIP Calculator"
          title="Plan your monthly SIP"
          subtitle="See how a small monthly investment can grow into substantial wealth over time. Adjust the inputs to match your plan."
        />

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
            {/* Form */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="monthly"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly investment (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" min={100} step={100} {...field} />
                        </FormControl>
                        <Slider
                          value={[Number(field.value) || 0]}
                          min={500}
                          max={100000}
                          step={500}
                          onValueChange={(v) => field.onChange(v[0])}
                          className="mt-2"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected return (% p.a.)</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} max={40} step={0.5} {...field} />
                        </FormControl>
                        <Slider
                          value={[Number(field.value) || 0]}
                          min={1}
                          max={30}
                          step={0.5}
                          onValueChange={(v) => field.onChange(v[0])}
                          className="mt-2"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="years"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time period (years)</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} max={40} step={1} {...field} />
                        </FormControl>
                        <Slider
                          value={[Number(field.value) || 0]}
                          min={1}
                          max={40}
                          step={1}
                          onValueChange={(v) => field.onChange(v[0])}
                          className="mt-2"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full gradient-brand text-primary-foreground">
                    Calculate
                  </Button>
                </form>
              </Form>
            </div>

            {/* Result */}
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <ResultStat label="Invested amount" value={formatINR(computed.invested)} />
                <ResultStat label="Estimated returns" value={formatINR(computed.returns)} accent />
                <ResultStat label="Total value" value={formatINR(computed.fv)} highlight />
              </div>
              <div className="h-[360px] rounded-2xl border border-border bg-card p-4 shadow-card">
                <ResultChart data={computed.series} valueLabel="SIP value" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <ComplianceFooter />
      <FloatingActions />
    </div>
  );
}

function ResultStat({
  label,
  value,
  accent,
  highlight,
}: {
  label: string;
  value: string;
  accent?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? "rounded-2xl border border-border gradient-brand p-5 text-primary-foreground shadow-elegant"
          : "rounded-2xl border border-border bg-card p-5 shadow-card"
      }
    >
      <p
        className={
          highlight
            ? "text-[11px] font-semibold uppercase tracking-wider text-primary-foreground/80"
            : "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
        }
      >
        {label}
      </p>
      <p
        className={
          "mt-2 font-display text-2xl font-bold tabular-nums " +
          (highlight ? "" : accent ? "text-profit" : "")
        }
      >
        {value}
      </p>
    </div>
  );
}
