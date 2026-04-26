import { useState } from "react";
import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  ExternalLink,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StatusBadge, type StatusTone } from "@/components/feedback/status-badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  useNdmlHistoryQuery,
  useNdmlKycStatusMutation,
  usePanHistoryQuery,
  useVerifyPanMutation,
} from "@/features/verification/api";
import {
  ndmlStatusSchema,
  panVerifySchema,
  type NdmlStatusValues,
  type PanVerifyValues,
} from "@/features/verification/schemas";
import {
  SAMPLE_INVALID_PAN,
  SAMPLE_NOT_FOUND_PAN,
  SAMPLE_REJECTED_PAN,
  SAMPLE_VALID_PAN,
} from "@/features/verification/fixtures";
import type {
  NdmlKycStatus,
  NdmlKycStatusResult,
  PanStatus,
  PanVerificationResult,
} from "@/types/verification";

import { useAuthStore } from "@/stores/auth-store";
import { ROLE_HOME } from "@/features/auth/role-routes";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/app/investor/verify")({
  beforeLoad: () => {
    const { user } = useAuthStore.getState();
    if (user && user.role !== "investor") throw redirect({ to: ROLE_HOME[user.role] });
  },
  head: () => ({ meta: [{ title: "Verification Tools — BuyBestFin" }] }),
  component: VerifyPage,
});

function VerifyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Verification Tools"
        description="Run live PAN validation against the BSE registry and check NDML KRA KYC status — both required before placing any order."
      />

      <div className="space-y-6 px-6 py-6 sm:px-8">
        <Tabs defaultValue="pan" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pan">PAN Verification</TabsTrigger>
            <TabsTrigger value="ndml">NDML KYC Status</TabsTrigger>
          </TabsList>

          <TabsContent value="pan" className="space-y-4">
            <PanVerifySection />
          </TabsContent>
          <TabsContent value="ndml" className="space-y-4">
            <NdmlStatusSection />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────── PAN Verification

function PanVerifySection() {
  const mutation = useVerifyPanMutation();
  const { data: history = [] } = usePanHistoryQuery();
  const [latest, setLatest] = useState<PanVerificationResult | null>(null);

  const form = useForm<PanVerifyValues>({
    resolver: zodResolver(panVerifySchema),
    defaultValues: { pan: "", fullName: "", dob: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const res = await mutation.mutateAsync(values);
      setLatest(res);
      if (res.status === "valid") {
        toast.success("PAN verified", { description: res.panHolderName });
      } else {
        toast.error("PAN not found in BSE registry");
      }
    } catch {
      toast.error("Verification failed. Try again.");
    }
  });

  function fillSample(pan: string) {
    form.setValue("pan", pan, { shouldValidate: true });
    form.setValue("fullName", pan === SAMPLE_INVALID_PAN ? "Test User" : "Aarav Mehta", {
      shouldValidate: true,
    });
    form.setValue("dob", "1992-07-18", { shouldValidate: true });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Card className="shadow-card lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" /> BSE PAN check
          </CardTitle>
          <CardDescription>
            Validates the PAN holder against the Income Tax + BSE Star MF registry.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
              <FormField
                control={form.control}
                name="pan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PAN</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ABCDE1234F"
                        maxLength={10}
                        className="font-mono uppercase tracking-widest"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormDescription>10 characters, format AAAAA9999A.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name on PAN</FormLabel>
                    <FormControl>
                      <Input placeholder="As printed on the PAN card" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of birth</FormLabel>
                    <FormControl>
                      <Input type="date" max={new Date().toISOString().slice(0, 10)} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  <button
                    type="button"
                    className="rounded-full border border-border px-2 py-0.5 text-muted-foreground hover:text-foreground"
                    onClick={() => fillSample(SAMPLE_VALID_PAN)}
                  >
                    Try valid
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-border px-2 py-0.5 text-muted-foreground hover:text-foreground"
                    onClick={() => fillSample(SAMPLE_INVALID_PAN)}
                  >
                    Try invalid
                  </button>
                </div>
                <Button type="submit" disabled={mutation.isPending} className="gap-2">
                  {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Verify PAN
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-4 lg:col-span-3">
        {latest ? (
          <PanResultCard result={latest} onRecheck={() => onSubmit()} pending={mutation.isPending} />
        ) : (
          <Card className="border-dashed bg-card/40 shadow-none">
            <CardContent className="flex flex-col items-center justify-center gap-2 py-14 text-center text-sm text-muted-foreground">
              <ShieldCheck className="h-8 w-8 text-muted-foreground/60" />
              <p>Submit a PAN to see the BSE registry response.</p>
            </CardContent>
          </Card>
        )}

        {history.length > 0 && (
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Recent PAN checks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 px-6 pb-6 pt-0">
              {history.map((r) => (
                <HistoryRow
                  key={r.id}
                  primary={r.pan}
                  secondary={r.panHolderName}
                  tone={r.status === "valid" ? "success" : "destructive"}
                  label={r.status === "valid" ? "Valid" : "Invalid"}
                  meta={formatDate(r.lastChecked)}
                  onClick={() => setLatest(r)}
                />
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

const PAN_TONE: Record<PanStatus, StatusTone> = { valid: "success", invalid: "destructive" };

function PanResultCard({
  result,
  onRecheck,
  pending,
}: {
  result: PanVerificationResult;
  onRecheck: () => void;
  pending: boolean;
}) {
  const ok = result.status === "valid";
  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              {ok ? (
                <CheckCircle2 className="h-5 w-5 text-success" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
              <span className="font-mono">{result.pan}</span>
            </CardTitle>
            <CardDescription>
              Checked {formatDate(result.lastChecked)} · BSE Star MF registry
            </CardDescription>
          </div>
          <StatusBadge tone={PAN_TONE[result.status]} label={ok ? "Valid PAN" : "Invalid PAN"} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6">
        <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
          <Row label="Holder name" value={result.panHolderName} />
          <Row
            label="Name match"
            value={
              ok ? (
                <span
                  className={`inline-flex items-center gap-1.5 ${result.nameMatch ? "text-success" : "text-warning"}`}
                >
                  {result.nameMatch ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5" />
                  )}
                  {result.nameMatch ? "Matches input" : "Mismatch — review"}
                </span>
              ) : (
                "—"
              )
            }
          />
          <Row label="Category" value={<span className="capitalize">{result.category}</span>} />
          <Row label="Status" value={ok ? "Active" : "Not registered"} />
        </dl>
        <div className="flex items-center justify-end gap-2">
          <Button size="sm" variant="outline" className="gap-1.5" disabled={pending} onClick={onRecheck}>
            <RefreshCw className="h-3.5 w-3.5" /> Re-check
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────── NDML KYC Status

function NdmlStatusSection() {
  const mutation = useNdmlKycStatusMutation();
  const { data: history = [] } = useNdmlHistoryQuery();
  const [latest, setLatest] = useState<NdmlKycStatusResult | null>(null);

  const form = useForm<NdmlStatusValues>({
    resolver: zodResolver(ndmlStatusSchema),
    defaultValues: { pan: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const res = await mutation.mutateAsync(values);
      setLatest(res);
      const labels: Record<NdmlKycStatus, string> = {
        verified: "KYC verified",
        in_review: "KYC under review",
        rejected: "KYC rejected",
        not_found: "No KYC record found",
      };
      if (res.kycStatus === "verified") toast.success(labels[res.kycStatus]);
      else if (res.kycStatus === "in_review") toast.info(labels[res.kycStatus]);
      else toast.warning(labels[res.kycStatus]);
    } catch {
      toast.error("Lookup failed. Try again.");
    }
  });

  function fillSample(pan: string) {
    form.setValue("pan", pan, { shouldValidate: true });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Card className="shadow-card lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 text-primary" /> NDML KRA lookup
          </CardTitle>
          <CardDescription>
            Queries NDML, CAMS, CVL and Karvy KRAs for the latest KYC record on this PAN.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
              <FormField
                control={form.control}
                name="pan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PAN</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ABCDE1234F"
                        maxLength={10}
                        className="font-mono uppercase tracking-widest"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  <button
                    type="button"
                    className="rounded-full border border-border px-2 py-0.5 text-muted-foreground hover:text-foreground"
                    onClick={() => fillSample(SAMPLE_VALID_PAN)}
                  >
                    Verified sample
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-border px-2 py-0.5 text-muted-foreground hover:text-foreground"
                    onClick={() => fillSample(SAMPLE_REJECTED_PAN)}
                  >
                    Rejected sample
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-border px-2 py-0.5 text-muted-foreground hover:text-foreground"
                    onClick={() => fillSample(SAMPLE_NOT_FOUND_PAN)}
                  >
                    Not found
                  </button>
                </div>
                <Button type="submit" disabled={mutation.isPending} className="gap-2">
                  {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Check status
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-4 lg:col-span-3">
        {latest ? (
          <NdmlResultCard result={latest} />
        ) : (
          <Card className="border-dashed bg-card/40 shadow-none">
            <CardContent className="flex flex-col items-center justify-center gap-2 py-14 text-center text-sm text-muted-foreground">
              <BadgeCheck className="h-8 w-8 text-muted-foreground/60" />
              <p>Enter a PAN to fetch its KRA KYC record.</p>
            </CardContent>
          </Card>
        )}

        {history.length > 0 && (
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Recent KYC lookups</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 px-6 pb-6 pt-0">
              {history.map((r) => (
                <HistoryRow
                  key={r.id}
                  primary={r.pan}
                  secondary={`${r.provider}${r.holderName ? ` · ${r.holderName}` : ""}`}
                  tone={NDML_TONE[r.kycStatus]}
                  label={NDML_LABEL[r.kycStatus]}
                  meta={r.lastUpdated ? formatDate(r.lastUpdated) : "—"}
                  onClick={() => setLatest(r)}
                />
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

const NDML_TONE: Record<NdmlKycStatus, StatusTone> = {
  verified: "success",
  in_review: "info",
  rejected: "destructive",
  not_found: "warning",
};
const NDML_LABEL: Record<NdmlKycStatus, string> = {
  verified: "Verified",
  in_review: "In review",
  rejected: "Rejected",
  not_found: "Not found",
};

function NdmlResultCard({ result }: { result: NdmlKycStatusResult }) {
  const needsAction = result.kycStatus === "not_found" || result.kycStatus === "rejected";
  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span className="font-mono">{result.pan}</span>
              <Badge variant="secondary" className="border-0 bg-secondary text-foreground">
                {result.provider}
              </Badge>
            </CardTitle>
            <CardDescription>
              {result.lastUpdated
                ? `Last updated ${formatDate(result.lastUpdated)}`
                : "No record date available"}
              {result.kraSource ? ` · source ${result.kraSource}` : ""}
            </CardDescription>
          </div>
          <StatusBadge tone={NDML_TONE[result.kycStatus]} label={NDML_LABEL[result.kycStatus]} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6">
        <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
          <Row label="Holder name" value={result.holderName ?? "—"} />
          <Row label="KRA source" value={result.kraSource ?? "—"} />
          <Row label="KYC status" value={NDML_LABEL[result.kycStatus]} />
          <Row label="Provider" value={result.provider} />
        </dl>
        {result.remarks && (
          <p className="rounded-lg border border-border bg-secondary/30 p-3 text-xs text-muted-foreground">
            {result.remarks}
          </p>
        )}
        {needsAction && (
          <div className="flex flex-col gap-3 rounded-lg border border-warning/30 bg-warning/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs">
              <p className="font-semibold text-foreground">Action required</p>
              <p className="mt-0.5 text-muted-foreground">
                {result.kycStatus === "not_found"
                  ? "This PAN has no KRA record. Complete fresh KYC to start investing."
                  : "Your KYC was rejected by the KRA. Re-submit corrected documents."}
              </p>
            </div>
            <Button asChild size="sm" className="gap-1.5">
              <Link to="/app/investor/profile">
                Go to KYC <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────── Shared bits

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}

function HistoryRow({
  primary,
  secondary,
  tone,
  label,
  meta,
  onClick,
}: {
  primary: string;
  secondary: string;
  tone: StatusTone;
  label: string;
  meta: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-card/50 px-3 py-2 text-left text-sm transition-colors hover:bg-secondary/40"
    >
      <div className="min-w-0">
        <p className="truncate font-mono text-xs font-semibold">{primary}</p>
        <p className="truncate text-[11px] text-muted-foreground">{secondary}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="text-[11px] text-muted-foreground">{meta}</span>
        <StatusBadge tone={tone} label={label} dot={false} />
      </div>
    </button>
  );
}
