import { useMemo } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useForm, type UseFormReturn, type FieldValues, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calculator,
  Calendar,
  LineChart as LineChartIcon,
  PiggyBank,
  Target,
  TrendingUp,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  goalSipCalculatorSchema,
  lumpsumCalculatorSchema,
  retirementSchema,
  sipCalculatorSchema,
  type GoalSipCalculatorValues,
  type LumpsumCalculatorValues,
  type RetirementValues,
  type SipCalculatorValues,
} from "@/features/calculators/schemas";
import {
  goalSipSeries,
  lumpsumFutureValue,
  lumpsumSeries,
  requiredSipForGoal,
  retirementPlan,
  sipFutureValue,
  sipSeries,
  stepUpSipFutureValue,
} from "@/features/calculators/math";
import { ResultChart } from "@/features/calculators/components/result-chart";

import { useAuthStore } from "@/stores/auth-store";
import { ROLE_HOME } from "@/features/auth/role-routes";
import { formatCompactINR, formatINR, formatPercent } from "@/lib/format";

export const Route = createFileRoute("/app/investor/calculators")({
  beforeLoad: () => {
    const { user } = useAuthStore.getState();
    if (user && user.role !== "investor") throw redirect({ to: ROLE_HOME[user.role] });
  },
  head: () => ({ meta: [{ title: "Calculators — BuyBestFin" }] }),
  component: CalculatorsPage,
});

function CalculatorsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Plan"
        title="Financial Calculators"
        description="Project your wealth, plan a goal, or model retirement — all calculations run live in your browser."
      />

      <div className="space-y-6 px-6 py-6 sm:px-8">
        <Tabs defaultValue="sip" className="space-y-6">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="sip" className="gap-1.5">
              <Calendar className="h-4 w-4" /> SIP
            </TabsTrigger>
            <TabsTrigger value="lumpsum" className="gap-1.5">
              <PiggyBank className="h-4 w-4" /> Lumpsum
            </TabsTrigger>
            <TabsTrigger value="goal" className="gap-1.5">
              <Target className="h-4 w-4" /> Goal SIP
            </TabsTrigger>
            <TabsTrigger value="retirement" className="gap-1.5">
              <TrendingUp className="h-4 w-4" /> Retirement
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sip">
            <SipCalculator />
          </TabsContent>
          <TabsContent value="lumpsum">
            <LumpsumCalculator />
          </TabsContent>
          <TabsContent value="goal">
            <GoalSipCalculator />
          </TabsContent>
          <TabsContent value="retirement">
            <RetirementPlanner />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────── Reusable bits

function ShellCard({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: typeof Calculator;
  children: React.ReactNode;
}) {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" /> {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6">{children}</CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  accent,
  tone,
}: {
  label: string;
  value: string;
  accent?: boolean;
  tone?: "success" | "warning";
}) {
  const toneClass =
    tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : undefined;
  return (
    <div className="rounded-xl border border-border bg-secondary/30 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-1 font-semibold tabular-nums ${
          accent ? "font-display text-xl" : "text-base"
        } ${toneClass ?? ""}`}
      >
        {value}
      </p>
    </div>
  );
}

interface NumberFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  label: string;
  hint?: string;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}

function NumberField<T extends FieldValues>({
  form,
  name,
  label,
  hint,
  min,
  max,
  step,
  suffix,
}: NumberFieldProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                type="number"
                inputMode="decimal"
                min={min}
                max={max}
                step={step ?? 1}
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                }
                onBlur={field.onBlur}
                className={suffix ? "pr-12 tabular-nums" : "tabular-nums"}
              />
              {suffix && (
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {suffix}
                </span>
              )}
            </div>
          </FormControl>
          {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// ─────────────────────────────────────────────── SIP

function SipCalculator() {
  const form = useForm<SipCalculatorValues>({
    resolver: zodResolver(sipCalculatorSchema),
    defaultValues: { monthly: 10000, annualReturn: 12, years: 15, stepUp: 0 },
    mode: "onChange",
  });
  const v = form.watch();
  const valid = form.formState.isValid;

  const result = useMemo(() => {
    if (!valid) return null;
    const fv =
      (v.stepUp ?? 0) > 0
        ? stepUpSipFutureValue(v.monthly, v.annualReturn, v.years, v.stepUp ?? 0)
        : sipFutureValue(v.monthly, v.annualReturn, v.years);
    const series = sipSeries(v.monthly, v.annualReturn, v.years, v.stepUp ?? 0);
    const invested = series[series.length - 1]?.invested ?? 0;
    return { fv, invested, gain: fv - invested, series };
  }, [v, valid]);

  return (
    <ShellCard
      title="SIP Calculator"
      description="See what a monthly investment can grow into over time, with optional annual step-up."
      icon={Calendar}
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <Form {...form}>
          <form className="space-y-4 lg:col-span-2" onSubmit={(e) => e.preventDefault()}>
            <NumberField form={form} name="monthly" label="Monthly investment" suffix="₹" min={500} step={500} />
            <NumberField form={form} name="annualReturn" label="Expected return (annual)" suffix="%" step={0.5} />
            <NumberField form={form} name="years" label="Investment tenure" suffix="yrs" />
            <NumberField
              form={form}
              name="stepUp"
              label="Annual step-up (optional)"
              suffix="%"
              hint="Increase the SIP amount by this % each year."
              step={1}
            />
          </form>
        </Form>

        <div className="space-y-4 lg:col-span-3">
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Invested" value={result ? formatINR(result.invested) : "—"} />
            <Stat label="Wealth gained" value={result ? formatINR(result.gain) : "—"} tone="success" />
            <Stat label="Future value" value={result ? formatCompactINR(result.fv) : "—"} accent />
          </div>
          <div className="rounded-xl border border-border bg-card/50 p-3">
            {result ? (
              <ResultChart data={result.series} />
            ) : (
              <EmptyChart hint="Enter valid inputs to see growth." />
            )}
          </div>
        </div>
      </div>
    </ShellCard>
  );
}

// ─────────────────────────────────────────────── Lumpsum

function LumpsumCalculator() {
  const form = useForm<LumpsumCalculatorValues>({
    resolver: zodResolver(lumpsumCalculatorSchema),
    defaultValues: { amount: 100000, annualReturn: 12, years: 10 },
    mode: "onChange",
  });
  const v = form.watch();
  const valid = form.formState.isValid;

  const result = useMemo(() => {
    if (!valid) return null;
    const fv = lumpsumFutureValue(v.amount, v.annualReturn, v.years);
    const series = lumpsumSeries(v.amount, v.annualReturn, v.years);
    return { fv, invested: v.amount, gain: fv - v.amount, series };
  }, [v, valid]);

  return (
    <ShellCard
      title="Lumpsum Calculator"
      description="Project the growth of a one-time investment compounded annually."
      icon={PiggyBank}
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <Form {...form}>
          <form className="space-y-4 lg:col-span-2" onSubmit={(e) => e.preventDefault()}>
            <NumberField form={form} name="amount" label="Investment amount" suffix="₹" step={1000} />
            <NumberField form={form} name="annualReturn" label="Expected return (annual)" suffix="%" step={0.5} />
            <NumberField form={form} name="years" label="Tenure" suffix="yrs" />
          </form>
        </Form>

        <div className="space-y-4 lg:col-span-3">
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Invested" value={result ? formatINR(result.invested) : "—"} />
            <Stat label="Wealth gained" value={result ? formatINR(result.gain) : "—"} tone="success" />
            <Stat label="Future value" value={result ? formatCompactINR(result.fv) : "—"} accent />
          </div>
          <div className="rounded-xl border border-border bg-card/50 p-3">
            {result ? (
              <ResultChart data={result.series} />
            ) : (
              <EmptyChart hint="Enter valid inputs to see growth." />
            )}
          </div>
        </div>
      </div>
    </ShellCard>
  );
}

// ─────────────────────────────────────────────── Goal SIP

function GoalSipCalculator() {
  const form = useForm<GoalSipCalculatorValues>({
    resolver: zodResolver(goalSipCalculatorSchema),
    defaultValues: { target: 5_000_000, years: 15, annualReturn: 12, currentSavings: 0 },
    mode: "onChange",
  });
  const v = form.watch();
  const valid = form.formState.isValid;

  const result = useMemo(() => {
    if (!valid) return null;
    const monthly = requiredSipForGoal(v.target, v.annualReturn, v.years, v.currentSavings ?? 0);
    const series = goalSipSeries(monthly, v.annualReturn, v.years, v.currentSavings ?? 0);
    const last = series[series.length - 1];
    return {
      monthly,
      series,
      finalValue: last?.value ?? 0,
      invested: last?.invested ?? 0,
    };
  }, [v, valid]);

  return (
    <ShellCard
      title="Goal SIP Calculator"
      description="Find the monthly SIP needed to reach a target corpus by your deadline."
      icon={Target}
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <Form {...form}>
          <form className="space-y-4 lg:col-span-2" onSubmit={(e) => e.preventDefault()}>
            <NumberField form={form} name="target" label="Target corpus" suffix="₹" step={10000} />
            <NumberField form={form} name="years" label="Time to goal" suffix="yrs" />
            <NumberField form={form} name="annualReturn" label="Expected return (annual)" suffix="%" step={0.5} />
            <NumberField
              form={form}
              name="currentSavings"
              label="Current savings (optional)"
              suffix="₹"
              hint="Already-invested amount to count toward the goal."
              step={1000}
            />
          </form>
        </Form>

        <div className="space-y-4 lg:col-span-3">
          <div className="grid grid-cols-3 gap-3">
            <Stat
              label="Required monthly SIP"
              value={result ? formatINR(result.monthly) : "—"}
              accent
            />
            <Stat label="Total invested" value={result ? formatINR(result.invested) : "—"} />
            <Stat
              label="Projected corpus"
              value={result ? formatCompactINR(result.finalValue) : "—"}
              tone="success"
            />
          </div>
          <div className="rounded-xl border border-border bg-card/50 p-3">
            {result ? (
              <ResultChart data={result.series} />
            ) : (
              <EmptyChart hint="Enter valid inputs to see required SIP." />
            )}
          </div>
        </div>
      </div>
    </ShellCard>
  );
}

// ─────────────────────────────────────────────── Retirement

function RetirementPlanner() {
  const form = useForm<RetirementValues>({
    resolver: zodResolver(retirementSchema),
    defaultValues: {
      currentAge: 32,
      retireAge: 60,
      lifeExpectancy: 85,
      monthlyExpenseToday: 60_000,
      inflationPct: 6,
      preReturnPct: 12,
      postReturnPct: 8,
    },
    mode: "onChange",
  });
  const v = form.watch();
  const valid = form.formState.isValid;

  const result = useMemo(() => {
    if (!valid) return null;
    return retirementPlan({
      currentAge: v.currentAge,
      retireAge: v.retireAge,
      lifeExpectancy: v.lifeExpectancy,
      monthlyExpenseToday: v.monthlyExpenseToday,
      inflationPct: v.inflationPct,
      preReturnPct: v.preReturnPct,
      postReturnPct: v.postReturnPct,
    });
  }, [v, valid]);

  return (
    <ShellCard
      title="Retirement Planner"
      description="Estimate the corpus you'll need and the monthly SIP required to get there."
      icon={LineChartIcon}
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <Form {...form}>
          <form className="space-y-4 lg:col-span-2" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-3 gap-3">
              <NumberField form={form} name="currentAge" label="Current age" />
              <NumberField form={form} name="retireAge" label="Retire age" />
              <NumberField form={form} name="lifeExpectancy" label="Life exp." />
            </div>
            <NumberField
              form={form}
              name="monthlyExpenseToday"
              label="Current monthly expense"
              suffix="₹"
              step={1000}
            />
            <div className="grid grid-cols-3 gap-3">
              <NumberField form={form} name="inflationPct" label="Inflation" suffix="%" step={0.5} />
              <NumberField form={form} name="preReturnPct" label="Pre-ret. return" suffix="%" step={0.5} />
              <NumberField form={form} name="postReturnPct" label="Post-ret. return" suffix="%" step={0.5} />
            </div>
          </form>
        </Form>

        <div className="space-y-4 lg:col-span-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat
              label="Years to retire"
              value={result ? `${result.yearsToRetire} yrs` : "—"}
            />
            <Stat
              label="Expense at 60"
              value={result ? formatINR(result.monthlyExpenseAtRetirement) + "/mo" : "—"}
            />
            <Stat
              label="Corpus needed"
              value={result ? formatCompactINR(result.corpusNeeded) : "—"}
              accent
            />
            <Stat
              label="Required SIP today"
              value={result ? formatINR(result.requiredMonthlySip) : "—"}
              tone="success"
            />
          </div>
          <div className="rounded-xl border border-border bg-card/50 p-3">
            {result ? (
              <ResultChart
                data={result.expenseSeries}
                xLabel="Age"
                hideInvested
                valueLabel="Annual expense"
              />
            ) : (
              <EmptyChart hint="Enter valid inputs to see your plan." />
            )}
          </div>
          {result && (
            <p className="rounded-lg border border-info/20 bg-info/5 p-3 text-[11px] text-muted-foreground">
              Assumes constant inflation of {formatPercent(v.inflationPct, 1)} and that the
              corpus is fully drawn down by age {v.lifeExpectancy}. Real returns are computed
              against inflation, so the post-retirement income preserves today's purchasing power.
            </p>
          )}
        </div>
      </div>
    </ShellCard>
  );
}

function EmptyChart({ hint }: { hint: string }) {
  return (
    <div className="grid h-[280px] place-items-center text-xs text-muted-foreground">{hint}</div>
  );
}
