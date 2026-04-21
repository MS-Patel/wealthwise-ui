export type InsightSeverity = "info" | "opportunity" | "warning" | "critical";

export type InsightCategory =
  | "rebalance"
  | "tax"
  | "performance"
  | "concentration"
  | "fees"
  | "goal"
  | "market"
  | "discovery";

export interface InsightAction {
  label: string;
  to?: string; // optional internal route
  variant?: "primary" | "secondary";
}

export interface Insight {
  id: string;
  category: InsightCategory;
  severity: InsightSeverity;
  title: string;
  body: string;
  reasoning: string[]; // bullet points the AI surfaced
  potentialImpact?: string; // e.g. "+₹42,000 / yr"
  confidence: number; // 0-100
  generatedAt: string; // ISO
  actions: InsightAction[];
}

export interface RiskProfile {
  score: number; // 0-100
  label: "Conservative" | "Moderate" | "Aggressive" | "Very Aggressive";
  drift: number; // current vs target equity %
  targetEquityPct: number;
  currentEquityPct: number;
}

export interface InsightsOverview {
  generatedAt: string;
  riskProfile: RiskProfile;
  marketSnapshot: {
    sentiment: "bullish" | "neutral" | "cautious";
    headline: string;
    nifty50Change: number;
    sensexChange: number;
    inrUsd: number;
  };
  insights: Insight[];
}
