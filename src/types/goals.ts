export type GoalCategory =
  | "retirement"
  | "house"
  | "education"
  | "vehicle"
  | "travel"
  | "wedding"
  | "emergency"
  | "wealth";

export type GoalPriority = "high" | "medium" | "low";

export type GoalStatus = "on_track" | "at_risk" | "behind" | "achieved";

export interface GoalLinkedHolding {
  holdingId: string;
  schemeName: string;
  amc: string;
  currentValue: number;
  monthlySip: number;
}

export interface Goal {
  id: string;
  name: string;
  category: GoalCategory;
  priority: GoalPriority;
  status: GoalStatus;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  expectedReturnPct: number;
  startDate: string; // ISO
  targetDate: string; // ISO
  inflationAdjusted: boolean;
  linkedHoldings: GoalLinkedHolding[];
  notes?: string;
}

export interface GoalsSummary {
  totalGoals: number;
  totalTarget: number;
  totalSaved: number;
  monthlyOutflow: number;
  onTrackCount: number;
  atRiskCount: number;
}

export interface GoalsOverview {
  summary: GoalsSummary;
  goals: Goal[];
}
