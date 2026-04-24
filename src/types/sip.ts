export type SipStatus = "active" | "paused" | "cancelled" | "completed";

export type SipFrequency = "monthly" | "quarterly";

export interface ActiveSip {
  id: string;
  schemeCode: string;
  schemeName: string;
  amc: string;
  monthlyAmount: number;
  frequency: SipFrequency;
  nextInstallmentDate: string; // ISO
  startDate: string; // ISO
  endDate?: string; // ISO
  installmentsDone: number;
  totalInstallments: number | null; // null = perpetual
  status: SipStatus;
  mandateRef: string;
  folioNumber: string;
  bankAccountId: string;
}

export type InstallmentStatus = "scheduled" | "processing" | "failed";

export interface UpcomingInstallment {
  id: string;
  sipId: string;
  schemeName: string;
  amc: string;
  amount: number;
  dueDate: string; // ISO
  status: InstallmentStatus;
}
