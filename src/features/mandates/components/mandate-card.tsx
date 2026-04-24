import { Landmark, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, type StatusTone } from "@/components/feedback/status-badge";
import { formatINR, formatDate } from "@/lib/format";
import { useRetryMandateMutation } from "@/features/mandates/api";
import type { Mandate, MandateStatus } from "@/types/mandate";
import { toast } from "sonner";

const TONE: Record<MandateStatus, StatusTone> = {
  pending: "warning",
  active: "success",
  rejected: "destructive",
  expired: "muted",
};

const LABEL: Record<MandateStatus, string> = {
  pending: "Pending approval",
  active: "Active",
  rejected: "Rejected",
  expired: "Expired",
};

export function MandateCard({ mandate }: { mandate: Mandate }) {
  const retry = useRetryMandateMutation();
  const canRetry = mandate.status === "rejected" || mandate.status === "expired";

  return (
    <Card className="shadow-card">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent">
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">{mandate.bankName}</p>
            <p className="font-mono text-xs text-muted-foreground">{mandate.accountMasked}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>
                Limit{" "}
                <span className="font-semibold text-foreground tabular-nums">
                  {formatINR(mandate.amountLimit)}
                </span>{" "}
                / month
              </span>
              <span>·</span>
              <span>Created {formatDate(mandate.createdAt)}</span>
              {mandate.umrn && (
                <>
                  <span>·</span>
                  <span className="font-mono">UMRN {mandate.umrn.slice(-6)}</span>
                </>
              )}
            </div>
            {mandate.failureReason && (
              <p className="mt-1 text-xs text-destructive">{mandate.failureReason}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge tone={TONE[mandate.status]} label={LABEL[mandate.status]} />
          {canRetry && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              disabled={retry.isPending}
              onClick={async () => {
                try {
                  await retry.mutateAsync(mandate.id);
                  toast.success("Mandate resubmitted");
                } catch {
                  toast.error("Retry failed");
                }
              }}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
