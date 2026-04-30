import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, FileText, Lock, ShieldCheck, Sparkles, Upload } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CASUploadDropzone } from "@/features/cas/components/upload-dropzone";
import { CASParseProgress } from "@/features/cas/components/parse-progress";
import { CASReviewTable, KIND_META } from "@/features/cas/components/review-table";
import { buildParseResult } from "@/features/cas/fixtures";
import { useCASStore } from "@/features/cas/store";
import type { CASParseResult, CASSource, ImportSelection } from "@/features/cas/types";
import { formatINR, formatPercent } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/app/investor/import")({
  head: () => ({ meta: [{ title: "Import CAS — BuyBestFin" }] }),
  component: CASImportPage,
});

type Stage = "upload" | "parsing" | "review" | "done";

const PARSE_STEPS = [
  "Decrypting PDF…",
  "Extracting folio data…",
  "Resolving ISINs and NAVs…",
  "Building consolidated portfolio…",
];

function CASImportPage() {
  const navigate = useNavigate();
  const setLastImport = useCASStore((s) => s.setLastImport);

  const [source, setSource] = useState<CASSource>("cams_kfintech");
  const [stage, setStage] = useState<Stage>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [progress, setProgress] = useState(0);
  const [stepLabel, setStepLabel] = useState(PARSE_STEPS[0]);
  const [result, setResult] = useState<CASParseResult | null>(null);
  const [selection, setSelection] = useState<ImportSelection>({});

  const startParse = () => {
    if (!file) {
      toast.error("Please select a CAS PDF first.");
      return;
    }
    setStage("parsing");
    setProgress(0);
    let pct = 0;
    let stepIdx = 0;
    setStepLabel(PARSE_STEPS[0]);
    const tick = setInterval(() => {
      pct += 8 + Math.random() * 12;
      if (pct >= 100) {
        pct = 100;
        clearInterval(tick);
        const r = buildParseResult(file.name);
        r.source = source;
        setResult(r);
        setSelection(Object.fromEntries(r.assets.map((a) => [a.id, true])));
        setProgress(100);
        setTimeout(() => setStage("review"), 350);
      } else {
        const newStep = Math.min(PARSE_STEPS.length - 1, Math.floor(pct / 25));
        if (newStep !== stepIdx) {
          stepIdx = newStep;
          setStepLabel(PARSE_STEPS[stepIdx]);
        }
        setProgress(Math.floor(pct));
      }
    }, 280);
  };

  const importSelected = () => {
    if (!result) return;
    const filtered: CASParseResult = {
      ...result,
      assets: result.assets.filter((a) => selection[a.id]),
    };
    // recompute totals
    let invested = 0, current = 0;
    const counts = { mutual_fund: 0, equity: 0, bond: 0, insurance: 0, nps: 0 };
    for (const a of filtered.assets) {
      counts[a.kind] += 1;
      if (a.kind === "insurance") { invested += a.premium; current += a.fundValue; }
      else { invested += a.invested; current += a.currentValue; }
    }
    filtered.totals = {
      netWorth: current,
      invested,
      gain: current - invested,
      returnPct: invested > 0 ? ((current - invested) / invested) * 100 : 0,
      counts,
    };
    setLastImport(filtered);
    setStage("done");
    toast.success(`Imported ${filtered.assets.length} positions from your CAS.`);
  };

  return (
    <>
      <PageHeader
        eyebrow="Import"
        title="Import your CAS"
        description="Bring every mutual fund, equity, bond, insurance and NPS holding into one consolidated dashboard — in under a minute."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/app/investor/investments">View all investments</Link>
          </Button>
        }
      />

      <div className="space-y-6 px-6 py-6 sm:px-8">
        <Stepper stage={stage} />

        {stage === "upload" && (
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="shadow-card lg:col-span-2">
              <CardHeader>
                <CardTitle>Upload statement</CardTitle>
                <CardDescription>
                  Pick your CAS source. Files are processed locally in your browser — never uploaded.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <Tabs value={source} onValueChange={(v) => setSource(v as CASSource)}>
                  <TabsList className="w-full">
                    <TabsTrigger value="cams_kfintech" className="flex-1 gap-1.5">
                      <FileText className="h-3.5 w-3.5" /> CAMS / KFintech
                    </TabsTrigger>
                    <TabsTrigger value="nsdl" className="flex-1 gap-1.5">
                      <FileText className="h-3.5 w-3.5" /> NSDL e-CAS
                    </TabsTrigger>
                    <TabsTrigger value="cdsl" className="flex-1 gap-1.5">
                      <FileText className="h-3.5 w-3.5" /> CDSL e-CAS
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="cams_kfintech" className="mt-4 space-y-4">
                    <SourceHelp text="Email request to mailback@camsonline.com or KFintech mailback. You'll receive a single password-protected PDF." />
                  </TabsContent>
                  <TabsContent value="nsdl" className="mt-4 space-y-4">
                    <SourceHelp text="NSDL emails a CAS PDF on the 10th of every month. Password is your PAN (uppercase) + DOB in DDMMYYYY." />
                  </TabsContent>
                  <TabsContent value="cdsl" className="mt-4 space-y-4">
                    <SourceHelp text="CDSL CAS arrives monthly from cas@cdslindia.co.in. Password is your PAN (uppercase) + DOB in DDMMYYYY." />
                  </TabsContent>
                </Tabs>

                <CASUploadDropzone selected={file} onFileSelected={setFile} />

                <div className="space-y-2">
                  <Label htmlFor="cas-pwd" className="flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5" /> PDF password
                  </Label>
                  <Input
                    id="cas-pwd"
                    type="password"
                    placeholder="Enter PDF password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Required to decrypt your CAS. Stored only in this browser tab.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                  <Button variant="ghost" onClick={() => { setFile(null); setPassword(""); }}>
                    Reset
                  </Button>
                  <Button className="gap-2" onClick={startParse} disabled={!file}>
                    Parse statement <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-success" /> What we extract
                </CardTitle>
                <CardDescription>One CAS gives us a complete net-worth picture.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  {(Object.keys(KIND_META) as Array<keyof typeof KIND_META>).map((k) => {
                    const meta = KIND_META[k];
                    const Icon = meta.icon;
                    return (
                      <li key={k} className="flex items-start gap-3">
                        <span className="mt-0.5 grid h-7 w-7 place-items-center rounded-md bg-secondary">
                          <Icon className={`h-3.5 w-3.5 ${meta.tone}`} />
                        </span>
                        <div>
                          <p className="font-medium">{meta.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {k === "mutual_fund" && "Folios, units, NAVs, P&L"}
                            {k === "equity" && "Demat shares with avg. buy & LTP"}
                            {k === "bond" && "G-Secs, NCDs, tax-free bonds"}
                            {k === "insurance" && "ULIPs, endowment, term covers"}
                            {k === "nps" && "Tier I/II PRAN with NAV"}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-5 rounded-lg border border-dashed border-border bg-secondary/30 p-3 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5 font-semibold text-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-accent" /> Privacy-first
                  </p>
                  <p className="mt-1">
                    Parsing happens on your device. We never store your CAS or password on our servers.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {stage === "parsing" && <CASParseProgress progress={progress} step={stepLabel} />}

        {stage === "review" && result && (
          <Card className="shadow-card">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <CardTitle>Review &amp; confirm</CardTitle>
                <CardDescription>
                  Found {result.assets.length} positions across {Object.values(result.totals.counts).filter(Boolean).length} asset
                  classes — period {result.periodFrom.slice(0, 7)} → {result.periodTo.slice(0, 7)}.
                </CardDescription>
              </div>
              <div className="grid grid-cols-3 gap-4 text-right">
                <SummaryStat label="Net worth" value={formatINR(result.totals.netWorth)} />
                <SummaryStat label="Invested" value={formatINR(result.totals.invested)} />
                <SummaryStat
                  label="Returns"
                  value={formatPercent(result.totals.returnPct)}
                  tone={result.totals.gain >= 0 ? "profit" : "loss"}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <CASReviewTable result={result} selection={selection} onChange={setSelection} />
              <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                <Button variant="ghost" onClick={() => setStage("upload")}>Back</Button>
                <Button
                  className="gap-2"
                  onClick={importSelected}
                  disabled={Object.values(selection).every((v) => !v)}
                >
                  Import {Object.values(selection).filter(Boolean).length} positions
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {stage === "done" && result && (
          <Card className="shadow-card">
            <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold">Import complete</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {result.assets.length} positions worth {formatINR(result.totals.netWorth)} added to your dashboard.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <Button onClick={() => navigate({ to: "/app/investor/investments" })} className="gap-2">
                  View all investments <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => { setStage("upload"); setFile(null); setPassword(""); setResult(null); }}>
                  Import another statement
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

function SourceHelp({ text }: { text: string }) {
  return (
    <p className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
      {text}
    </p>
  );
}

function SummaryStat({ label, value, tone }: { label: string; value: string; tone?: "profit" | "loss" }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p
        className={`mt-1 font-display text-lg font-bold tabular-nums ${
          tone === "profit" ? "text-profit" : tone === "loss" ? "text-loss" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Stepper({ stage }: { stage: Stage }) {
  const steps = [
    { key: "upload", label: "Upload" },
    { key: "parsing", label: "Parse" },
    { key: "review", label: "Review" },
    { key: "done", label: "Done" },
  ] as const;
  const currentIdx = steps.findIndex((s) => s.key === stage);
  return (
    <ol className="flex items-center gap-2 overflow-x-auto rounded-xl border border-border bg-card p-3 text-xs">
      {steps.map((s, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <li key={s.key} className="flex flex-1 items-center gap-2">
            <span
              className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                done
                  ? "bg-success text-success-foreground"
                  : active
                    ? "gradient-brand text-primary-foreground shadow-glow"
                    : "bg-secondary text-muted-foreground"
              }`}
            >
              {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className={active || done ? "font-semibold" : "text-muted-foreground"}>{s.label}</span>
            {i < steps.length - 1 && <span className="mx-1 h-px flex-1 bg-border" />}
          </li>
        );
      })}
    </ol>
  );
}
