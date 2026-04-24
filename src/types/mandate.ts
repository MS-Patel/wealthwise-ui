export type MandateStatus = "pending" | "active" | "rejected" | "expired";

export interface Mandate {
  id: string;
  bankAccountId: string;
  bankName: string;
  accountMasked: string;
  amountLimit: number;
  status: MandateStatus;
  createdAt: string; // ISO
  approvedAt?: string;
  failureReason?: string;
  umrn?: string;
}
