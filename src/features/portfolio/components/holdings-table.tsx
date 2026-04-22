import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpDown, Repeat2, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Holding } from "@/types/portfolio";
import { formatCompactINR, formatINR, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

type SortKey = "name" | "invested" | "value" | "gain" | "return" | "xirr";

interface HoldingsTableProps {
  holdings: Holding[];
}

const ASSET_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "all", label: "All assets" },
  { value: "equity", label: "Equity" },
  { value: "debt", label: "Debt" },
  { value: "gold", label: "Gold" },
  { value: "international", label: "International" },
  { value: "hybrid", label: "Hybrid" },
];

export function HoldingsTable({ holdings }: HoldingsTableProps) {
  const [query, setQuery] = useState("");
  const [asset, setAsset] = useState<string>("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "value", dir: "desc" });

  const rows = useMemo(() => {
    let filtered = holdings.filter((h) =>
      h.schemeName.toLowerCase().includes(query.toLowerCase()) || h.amc.toLowerCase().includes(query.toLowerCase()),
    );
    if (asset !== "all") filtered = filtered.filter((h) => h.assetClass === asset);
    const dir = sort.dir === "asc" ? 1 : -1;
    filtered.sort((a, b) => {
      switch (sort.key) {
        case "name":
          return a.schemeName.localeCompare(b.schemeName) * dir;
        case "invested":
          return (a.invested - b.invested) * dir;
        case "value":
          return (a.currentValue - b.currentValue) * dir;
        case "gain":
          return (a.unrealizedGain - b.unrealizedGain) * dir;
        case "return":
          return (a.returnPct - b.returnPct) * dir;
        case "xirr":
          return (a.xirr - b.xirr) * dir;
      }
    });
    return filtered;
  }, [holdings, query, asset, sort]);

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }));

  const totals = useMemo(
    () => ({
      invested: rows.reduce((s, r) => s + r.invested, 0),
      value: rows.reduce((s, r) => s + r.currentValue, 0),
      gain: rows.reduce((s, r) => s + r.unrealizedGain, 0),
    }),
    [rows],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search funds or AMCs…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={asset} onValueChange={setAsset}>
          <SelectTrigger className="sm:w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ASSET_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-border md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/40 hover:bg-secondary/40">
              <SortHeader label="Fund" onClick={() => toggleSort("name")} active={sort.key === "name"} dir={sort.dir} />
              <SortHeader label="Invested" align="right" onClick={() => toggleSort("invested")} active={sort.key === "invested"} dir={sort.dir} />
              <SortHeader label="Current" align="right" onClick={() => toggleSort("value")} active={sort.key === "value"} dir={sort.dir} />
              <SortHeader label="Gain" align="right" onClick={() => toggleSort("gain")} active={sort.key === "gain"} dir={sort.dir} />
              <SortHeader label="Return" align="right" onClick={() => toggleSort("return")} active={sort.key === "return"} dir={sort.dir} />
              <SortHeader label="XIRR" align="right" onClick={() => toggleSort("xirr")} active={sort.key === "xirr"} dir={sort.dir} />
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                  No holdings match your filters.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((h) => (
                <TableRow key={h.id} className="group">
                  <TableCell className="max-w-[280px]">
                    <div className="flex flex-col">
                      <span className="truncate font-semibold">{h.schemeName}</span>
                      <span className="mt-0.5 flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                        {h.amc}
                        <span className="text-border">·</span>
                        {h.category}
                        {h.sip && (
                          <Badge variant="secondary" className="h-4 border-0 bg-accent/15 px-1.5 text-[9px] font-bold uppercase text-accent">
                            <Repeat2 className="mr-0.5 h-2.5 w-2.5" /> SIP
                          </Badge>
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {formatINR(h.invested)}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{formatINR(h.currentValue)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    <GainBadge value={h.unrealizedGain} />
                  </TableCell>
                  <TableCell className={cn("text-right font-semibold tabular-nums", h.returnPct >= 0 ? "text-profit" : "text-loss")}>
                    {formatPercent(h.returnPct)}
                  </TableCell>
                  <TableCell className={cn("text-right font-semibold tabular-nums", h.xirr >= 0 ? "text-profit" : "text-loss")}>
                    {formatPercent(h.xirr)}
                  </TableCell>
                  <TableCell className="opacity-0 transition-opacity group-hover:opacity-100">
                    <Button asChild size="sm" variant="ghost">
                      <Link to="/app/investor/portfolio/$holdingId" params={{ holdingId: h.id }}>
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="border-t border-border bg-secondary/30 text-sm font-semibold">
                <td className="px-4 py-3">Totals ({rows.length})</td>
                <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{formatINR(totals.invested)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatINR(totals.value)}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  <GainBadge value={totals.gain} />
                </td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          )}
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {rows.map((h) => (
          <Link
            key={h.id}
            to="/app/investor/portfolio/$holdingId"
            params={{ holdingId: h.id }}
            className="block rounded-xl border border-border bg-card p-4 shadow-card transition-shadow hover:shadow-elegant"
          >
            <p className="font-semibold leading-snug">{h.schemeName}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
              {h.amc} · {h.category}
              {h.sip && <Badge className="h-4 border-0 bg-accent/15 px-1.5 text-[9px] text-accent">SIP</Badge>}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <Field label="Invested" value={formatCompactINR(h.invested)} />
              <Field label="Current" value={formatCompactINR(h.currentValue)} accent />
              <Field label="Gain" value={formatCompactINR(h.unrealizedGain)} positive={h.unrealizedGain >= 0} />
              <Field label="Return" value={formatPercent(h.returnPct)} positive={h.returnPct >= 0} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function SortHeader({
  label,
  align = "left",
  onClick,
  active,
  dir,
}: {
  label: string;
  align?: "left" | "right";
  onClick: () => void;
  active: boolean;
  dir: "asc" | "desc";
}) {
  return (
    <TableHead className={align === "right" ? "text-right" : ""}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider transition-colors hover:text-foreground",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
        <ArrowUpDown className={cn("h-3 w-3", active && "text-accent", active && dir === "asc" && "rotate-180")} />
      </button>
    </TableHead>
  );
}

function GainBadge({ value }: { value: number }) {
  const positive = value >= 0;
  const Icon = positive ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-semibold tabular-nums",
        positive ? "bg-success/12 text-success" : "bg-destructive/12 text-destructive",
      )}
    >
      <Icon className="h-3 w-3" />
      {formatINR(Math.abs(value))}
    </span>
  );
}

function Field({ label, value, accent, positive }: { label: string; value: string; accent?: boolean; positive?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-0.5 font-semibold tabular-nums",
          accent && "text-foreground",
          positive === true && "text-profit",
          positive === false && "text-loss",
        )}
      >
        {value}
      </p>
    </div>
  );
}
