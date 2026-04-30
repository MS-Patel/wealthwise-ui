import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Props {
  progress: number;
  step: string;
}

export function CASParseProgress({ progress, step }: Props) {
  return (
    <div className="rounded-xl border border-border bg-card p-8 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
        <Loader2 className="h-7 w-7 animate-spin" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold">Parsing your CAS</h3>
      <p className="mt-1 text-sm text-muted-foreground">{step}</p>
      <div className="mx-auto mt-6 max-w-md">
        <Progress value={progress} />
        <p className="mt-2 text-xs tabular-nums text-muted-foreground">{progress}%</p>
      </div>
    </div>
  );
}
