import { z } from "zod";

export const goalCategorySchema = z.enum([
  "retirement",
  "house",
  "education",
  "vehicle",
  "travel",
  "wedding",
  "emergency",
  "wealth",
]);

export const goalPrioritySchema = z.enum(["high", "medium", "low"]);

export const goalWizardSchema = z.object({
  name: z.string().min(2, "Goal name is required"),
  category: goalCategorySchema,
  priority: goalPrioritySchema,
  targetAmount: z
    .number({ error: "Target amount required" })
    .min(10000, "Minimum ₹10,000"),
  targetDate: z.string().min(1, "Target date required").refine(
    (d) => +new Date(d) > Date.now() + 30 * 86400_000,
    "Target must be at least 30 days away",
  ),
  monthlyContribution: z
    .number({ error: "Monthly contribution required" })
    .min(0, "Cannot be negative"),
  expectedReturnPct: z
    .number({ error: "Expected return required" })
    .min(1, "Min 1%")
    .max(30, "Max 30%"),
});

export type GoalWizardValues = z.infer<typeof goalWizardSchema>;
