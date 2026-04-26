import { z } from "zod";

export const sipCalculatorSchema = z.object({
  monthly: z.number({ error: "Enter monthly amount" }).min(500, "Min ₹500").max(10_000_000),
  annualReturn: z.number({ error: "Enter expected return" }).min(1, "Min 1%").max(30, "Max 30%"),
  years: z.number({ error: "Enter tenure" }).int("Whole years").min(1, "Min 1 yr").max(40, "Max 40 yrs"),
  stepUp: z.number().min(0).max(50),
});

export const lumpsumCalculatorSchema = z.object({
  amount: z.number({ error: "Enter amount" }).min(1000, "Min ₹1,000").max(1_000_000_000),
  annualReturn: z.number({ error: "Enter expected return" }).min(1).max(30),
  years: z.number({ error: "Enter tenure" }).int().min(1).max(40),
});

export const goalSipCalculatorSchema = z.object({
  target: z.number({ error: "Enter target corpus" }).min(10_000).max(1_000_000_000),
  years: z.number({ error: "Enter tenure" }).int().min(1).max(40),
  annualReturn: z.number({ error: "Enter expected return" }).min(1).max(30),
  currentSavings: z.number().min(0),
});

export const retirementSchema = z
  .object({
    currentAge: z.number({ error: "Enter current age" }).int().min(18, "Min 18").max(80),
    retireAge: z.number({ error: "Enter retirement age" }).int().min(30, "Min 30").max(85),
    lifeExpectancy: z.number({ error: "Enter life expectancy" }).int().min(60).max(110),
    monthlyExpenseToday: z.number({ error: "Enter monthly expense" }).min(5_000).max(10_000_000),
    inflationPct: z.number({ error: "Enter inflation" }).min(0).max(20),
    preReturnPct: z.number({ error: "Enter pre-retirement return" }).min(1).max(25),
    postReturnPct: z.number({ error: "Enter post-retirement return" }).min(1).max(20),
  })
  .superRefine((val, ctx) => {
    if (val.retireAge <= val.currentAge) {
      ctx.addIssue({
        code: "custom",
        path: ["retireAge"],
        message: "Must be greater than current age",
      });
    }
    if (val.lifeExpectancy <= val.retireAge) {
      ctx.addIssue({
        code: "custom",
        path: ["lifeExpectancy"],
        message: "Must be greater than retirement age",
      });
    }
  });

export type SipCalculatorValues = z.infer<typeof sipCalculatorSchema>;
export type LumpsumCalculatorValues = z.infer<typeof lumpsumCalculatorSchema>;
export type GoalSipCalculatorValues = z.infer<typeof goalSipCalculatorSchema>;
export type RetirementValues = z.infer<typeof retirementSchema>;
