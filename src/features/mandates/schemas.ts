import { z } from "zod";

export const createMandateSchema = z.object({
  bankAccountId: z.string().min(1, "Select a bank account"),
  amountLimit: z
    .number({ error: "Enter an amount" })
    .min(500, "Minimum ₹500")
    .max(1_000_000, "Maximum ₹10,00,000"),
});

export type CreateMandateValues = z.infer<typeof createMandateSchema>;
