import {
  LayoutDashboard,
  PieChart,
  Wallet,
  Repeat2,
  ReceiptText,
  ShieldCheck,
  Target,
  Sparkles,
  Calculator,
  Bell,
  Settings,
  Compass,
  TrendingUp,
  Repeat,
  FileBarChart,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/types/auth";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  badge?: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

const investorNav: NavSection[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", to: "/app/investor", icon: LayoutDashboard },
      { label: "Portfolio", to: "/app/investor/portfolio", icon: PieChart },
      { label: "Transactions", to: "/app/investor/transactions", icon: ReceiptText },
    ],
  },
  {
    label: "Invest",
    items: [
      { label: "Explore Schemes", to: "/app/investor/explore", icon: Compass },
      { label: "Lumpsum", to: "/app/investor/orders/lumpsum", icon: TrendingUp },
      { label: "SIP", to: "/app/investor/orders/sip", icon: Wallet },
      { label: "My SIPs", to: "/app/investor/sips", icon: Repeat },
      { label: "Redeem", to: "/app/investor/orders/redeem", icon: Wallet },
      { label: "Switch", to: "/app/investor/orders/switch", icon: Repeat2 },
    ],
  },
  {
    label: "Plan",
    items: [
      { label: "Goals", to: "/app/investor/goals", icon: Target },
      { label: "Tax Harvesting", to: "/app/investor/tax", icon: Calculator },
      { label: "Reports", to: "/app/investor/reports", icon: FileBarChart },
      { label: "AI Insights", to: "/app/investor/insights", icon: Sparkles, badge: "Beta" },
    ],
  },
  {
    label: "Account",
    items: [{ label: "KYC & Profile", to: "/app/investor/profile", icon: ShieldCheck }],
  },
];

export const NAV_BY_ROLE: Record<UserRole, NavSection[]> = {
  investor: investorNav,
};

export const SHARED_BOTTOM_NAV: NavItem[] = [
  { label: "Notifications", to: "/app/notifications", icon: Bell },
  { label: "Settings", to: "/app/settings", icon: Settings },
];
