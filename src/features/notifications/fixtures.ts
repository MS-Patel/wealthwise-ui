import type { Notification } from "@/types/notifications";

const HOUR = 60 * 60 * 1000;
const now = Date.now();

export const NOTIFICATION_FIXTURES: Notification[] = [
  {
    id: "ntf_01",
    category: "order",
    severity: "success",
    title: "SIP installment processed",
    body: "Parag Parikh Flexi Cap — ₹15,000 debited & 28.412 units allotted at NAV ₹527.91.",
    createdAt: new Date(now - 1.5 * HOUR).toISOString(),
    read: false,
    href: "/app/investor/portfolio",
  },
  {
    id: "ntf_02",
    category: "kyc",
    severity: "warning",
    title: "Re-KYC due in 22 days",
    body: "Your CKYC profile expires on 09 May 2026. Update your address proof to avoid order rejections.",
    createdAt: new Date(now - 6 * HOUR).toISOString(),
    read: false,
  },
  {
    id: "ntf_03",
    category: "alert",
    severity: "info",
    title: "Rebalancing suggestion ready",
    body: "Equity allocation drifted to 78% (target 70%). Tap to review the proposed switch plan.",
    createdAt: new Date(now - 26 * HOUR).toISOString(),
    read: false,
  },
  {
    id: "ntf_04",
    category: "payout",
    severity: "success",
    title: "Redemption credited",
    body: "₹1,20,000 redeemed from Axis Bluechip credited to HDFC ••4521.",
    createdAt: new Date(now - 50 * HOUR).toISOString(),
    read: true,
  },
  {
    id: "ntf_05",
    category: "system",
    severity: "info",
    title: "Statement ready",
    body: "Your Q4 FY26 portfolio statement is available for download.",
    createdAt: new Date(now - 96 * HOUR).toISOString(),
    read: true,
  },
  {
    id: "ntf_06",
    category: "alert",
    severity: "error",
    title: "Mandate expiring",
    body: "ICICI auto-debit mandate expires on 30 Apr. Renew now to keep SIPs running.",
    createdAt: new Date(now - 120 * HOUR).toISOString(),
    read: true,
  },
];
