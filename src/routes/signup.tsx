import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowRight, Eye, EyeOff, Loader2, ShieldCheck, TrendingUp } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { BrandLogo } from "@/components/brand/brand-logo";

import { useAuthStore } from "@/stores/auth-store";
import { useSignupMutation } from "@/features/auth/api";
import { signupSchema, type SignupFormValues } from "@/features/auth/schemas";
import { ROLE_HOME } from "@/features/auth/role-routes";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create account — BuyBestFin" },
      { name: "description", content: "Open your BuyBestFin account in 3 minutes — 100% paperless KYC." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [showPassword, setShowPassword] = useState(false);
  const signup = useSignupMutation();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      mobile: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false as unknown as true,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const result = await signup.mutateAsync({
        fullName: values.fullName,
        email: values.email,
        mobile: values.mobile,
        password: values.password,
      });
      setSession(result);
      toast.success("Welcome to BuyBestFin", { description: "Let’s complete your KYC." });
      navigate({ to: ROLE_HOME[result.user.role] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Signup failed");
    }
  });

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_minmax(0,0.95fr)]">
        <BrandPanel />
        <section className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center justify-between lg:hidden">
              <BrandLogo />
            </div>
            <div className="mb-8">
              <Badge variant="secondary" className="mb-4 rounded-full bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent">
                Open account
              </Badge>
              <h1 className="font-display text-3xl font-bold tracking-tight">
                Start your investing journey
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                100% paperless. KYC powered by NDML. Free forever — no commissions on direct funds.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" autoComplete="name" placeholder="As per PAN" {...form.register("fullName")} />
                {form.formState.errors.fullName && (
                  <p className="text-xs text-destructive">{form.formState.errors.fullName.message}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@email.com"
                    {...form.register("email")}
                  />
                  {form.formState.errors.email && (
                    <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="mobile">Mobile</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+91 98765 43210"
                    {...form.register("mobile")}
                  />
                  {form.formState.errors.mobile && (
                    <p className="text-xs text-destructive">{form.formState.errors.mobile.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    className="pr-10"
                    {...form.register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  {...form.register("confirmPassword")}
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-xs text-destructive">{form.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <label className="flex items-start gap-2.5 rounded-lg border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
                <Checkbox
                  checked={form.watch("agreeTerms") === true}
                  onCheckedChange={(v) =>
                    form.setValue("agreeTerms", (v === true) as true, { shouldValidate: true })
                  }
                  className="mt-0.5"
                />
                <span>
                  I agree to BuyBestFin's{" "}
                  <a className="font-medium text-foreground underline-offset-4 hover:underline">Terms</a>{" "}
                  and{" "}
                  <a className="font-medium text-foreground underline-offset-4 hover:underline">Privacy Policy</a>,
                  and consent to KYC verification by NDML.
                </span>
              </label>
              {form.formState.errors.agreeTerms && (
                <p className="text-xs text-destructive">{form.formState.errors.agreeTerms.message}</p>
              )}

              <Button type="submit" className="w-full gap-2" size="lg" disabled={signup.isPending}>
                {signup.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                Create account
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-foreground hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function BrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-sidebar text-sidebar-foreground lg:flex lg:flex-col lg:justify-between">
      <div
        aria-hidden
        className="absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(circle at 18% 20%, color-mix(in oklab, var(--accent) 35%, transparent), transparent 55%), radial-gradient(circle at 80% 85%, color-mix(in oklab, var(--primary-glow) 45%, transparent), transparent 60%), var(--sidebar)",
        }}
      />
      <div className="relative z-10 flex flex-col gap-12 p-12">
        <BrandLogo />
        <div className="max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sidebar-foreground/55">
            Welcome to BuyBestFin
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold leading-tight tracking-tight">
            Wealth, planned beautifully.
          </h2>
          <p className="mt-4 text-base text-sidebar-foreground/70">
            Direct mutual funds, intelligent goal planning, and tax-loss harvesting — all in one
            place. Trusted by 22,000+ investors across India.
          </p>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-4 p-12">
        <div className="rounded-2xl border border-sidebar-border/60 bg-sidebar-accent/40 p-4 backdrop-blur-sm">
          <div className="grid h-9 w-9 place-items-center rounded-lg gradient-accent shadow-glow">
            <ShieldCheck className="h-4.5 w-4.5 text-accent-foreground" />
          </div>
          <p className="mt-3 text-sm font-semibold">SEBI-compliant</p>
          <p className="text-xs text-sidebar-foreground/60">KYC, AMFI, NDML</p>
        </div>
        <div className="rounded-2xl border border-sidebar-border/60 bg-sidebar-accent/40 p-4 backdrop-blur-sm">
          <div className="grid h-9 w-9 place-items-center rounded-lg gradient-accent shadow-glow">
            <TrendingUp className="h-4.5 w-4.5 text-accent-foreground" />
          </div>
          <p className="mt-3 text-sm font-semibold">₹2,400 Cr+</p>
          <p className="text-xs text-sidebar-foreground/60">AUM serviced</p>
        </div>
      </div>
    </aside>
  );
}
