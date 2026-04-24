import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { KYC_FIXTURE } from "@/features/kyc/fixtures";
import { createMandateSchema, type CreateMandateValues } from "@/features/mandates/schemas";
import { useCreateMandateMutation } from "@/features/mandates/api";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateMandateDialog({ open, onOpenChange }: Props) {
  const mutation = useCreateMandateMutation();
  const form = useForm<CreateMandateValues>({
    resolver: zodResolver(createMandateSchema),
    defaultValues: {
      bankAccountId: KYC_FIXTURE.bankAccounts.find((b) => b.isPrimary)?.id ?? "",
      amountLimit: 50000,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync(values);
      toast.success("Mandate request submitted", {
        description: "It will be approved by your bank within 2 working days.",
      });
      onOpenChange(false);
      form.reset();
    } catch {
      toast.error("Could not submit mandate");
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add bank mandate</DialogTitle>
          <DialogDescription>
            A NACH mandate authorises auto-debit for SIPs up to a monthly limit.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="bank">Bank account</Label>
            <Controller
              control={form.control}
              name="bankAccountId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="bank">
                    <SelectValue placeholder="Choose an account" />
                  </SelectTrigger>
                  <SelectContent>
                    {KYC_FIXTURE.bankAccounts.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.bankName} · {b.accountNumberMasked}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.bankAccountId && (
              <p className="text-xs text-destructive">{form.formState.errors.bankAccountId.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="amount">Monthly limit (₹)</Label>
            <Input
              id="amount"
              type="number"
              min={500}
              max={1_000_000}
              step={500}
              {...form.register("amountLimit", { valueAsNumber: true })}
            />
            <p className="text-xs text-muted-foreground">
              Sum of all SIPs against this mandate cannot exceed this limit.
            </p>
            {form.formState.errors.amountLimit && (
              <p className="text-xs text-destructive">{form.formState.errors.amountLimit.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="gap-2">
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit mandate
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
