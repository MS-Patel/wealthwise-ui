export type NotificationCategory =
  | "order"
  | "kyc"
  | "sip"
  | "payout"
  | "system"
  | "alert";

export type NotificationSeverity = "info" | "success" | "warning" | "error";

export interface Notification {
  id: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  href?: string;
}
