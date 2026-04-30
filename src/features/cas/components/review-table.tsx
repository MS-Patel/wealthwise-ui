import { useMemo, useState } from "react";
import { Briefcase, Building2, Coins, ShieldCheck, PiggyBank } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AssetKind, CASAsset, CASParseResult, ImportSelection } from "../types";

const KIND_META: Record<AssetKind, { label: string; icon: typeof Briefcase; tone: string }> = {
  mutual_fund: { label: "Mutual Funds", icon: Briefcase, tone: "text-chart-1" },
  equity: { label: "Equities", icon: Building2, tone: "text-chart-2" },
  bond: { label: "Bonds", icon: Coins, tone: "text-chart-3" },
  insurance: { label: "Insurance", icon: ShieldCheck, tone: "text-chart-4" },
  nps: { label: "NPS", icon: PiggyBank, tone: "text-chart-5" },
};

function valueOf(a: CASAsset) {
  switch (a.kind) {
    case "mutual_fund":
    case "equity":
    case "bond":
    case "nps":
      return { invested: a.invested, current: a.currentValue };
    case "insurance":
      return { invested: a.premium, current: a.fundValue || a.sumAssured * 0.05 };
  }
}

function describe(a: CASAsset): { title: string; sub: string } {
  switch (a.kind) {
    case "mutual_fund":
      return { title: a.scheme, sub: `${a.amc} · Folio ${a.folio} · ${a.units.toFixed(2)} units` };
    case "equity":
      return { title: `${a.symbol} — ${a.company}`, sub: `${a.exchange} · ${a.depository} · ${a.qty} shares` };
    case "bond":
      return { title: a.issuer, sub: `Coupon ${a.couponPct}% · Matures ${a.maturity.slice(0, 7)}` };
    case "insurance":
      return { title: `${a.insurer} — ${a.product}`, sub: `${a.type.toUpperCase()} · Policy ${a.policyNumber}` };
    case "nps":
      return { title: a.scheme, sub: `Tier ${a.tier} · PRAN ${a.pran}` };
  }
}

interface Props {
  result: CASParseResult;
  selection: ImportSelection;
  onChange: (next: ImportSelection) => void;
}

export function CASReviewTable({ result, selection, onChange }: Props) {
  const [activeTab, setActiveTab] = useState<AssetKind>("mutual_fund");
  const grouped = useMemo(() => {
    const m: Record<AssetKind, CASAsset[]> = {
      mutual_fund: [], equity: [], bond: [], insurance: [], nps: [],
    };
    for (const a of result.assets) m[a.kind].push(a);
    return m;
  }, [result.assets]);

  const toggle = (id: string) => onChange({ ...selection, [id]: !selection[id] });
  const toggleAll = (kind: AssetKind, on: boolean) => {
    const next = { ...selection };
    for (const a of grouped[kind]) next[a.id] = on;
    onChange(next);
  };

  const list = grouped[activeTab];
  const allOn = list.length > 0 && list.every((a) => selection[a.id]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(KIND_META) as AssetKind[]).map((k) => {
          const meta = KIND_META[k];
          const Icon = meta.icon;
          const count = grouped[k].length;
          const on = activeTab === k;
          return (
            <button
              key={k}
              type="button"
              onClick={() => setActiveTab(k)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
                on
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:border-primary/40",
              )}
              disabled={count === 0}
            >
              <Icon className={cn("h-3.5 w-3.5", !on && meta.tone)} />
              {meta.label}
              <Badge variant="secondary" className={cn("ml-1 border-0 text-[10px]", on && "bg-primary-foreground/20 text-primary-foreground")}>
                {count}
              </Badge>
            </button>
          );
        })}
      </div>

      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No {KIND_META[activeTab].label.toLowerCase()} found in this statement.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="flex items-center gap-3 border-b border-border bg-secondary/40 px-4 py-2.5 text-xs">
            <Checkbox checked={allOn} onCheckedChange={(v) => toggleAll(activeTab, !!v)} />
            <span className="font-semibold uppercase tracking-wider text-muted-foreground">
              Select all ({list.length})
            </span>
          </div>
          <ul className="divide-y divide-border">
            {list.map((a) => {
              const d = describe(a);
              const v = valueOf(a);
              const checked = !!selection[a.id];
              return (
                <li key={a.id} className="flex items-start gap-3 px-4 py-3 hover:bg-secondary/30">
                  <Checkbox checked={checked} onCheckedChange={() => toggle(a.id)} className="mt-1" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{d.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{d.sub}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold tabular-nums">{formatINR(v.current)}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">Invested {formatINR(v.invested)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export { KIND_META };
