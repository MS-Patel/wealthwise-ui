import { z } from "zod";

export const addBankSchema = z.object({
  bankName: z.string().min(2, "Bank name is required"),
  accountNumber: z
    .string()
    .min(8, "Account number too short")
    .max(20, "Account number too long")
    .regex(/^[0-9]+$/, "Digits only"),
  ifsc: z
    .string()
    .length(11, "IFSC must be 11 characters")
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC format"),
  accountType: z.enum(["savings", "current"]),
});

export type AddBankValues = z.infer<typeof addBankSchema>;

export const addNomineeSchema = z.object({
  name: z.string().min(2, "Nominee name is required"),
  relation: z.string().min(2, "Relation is required"),
  dob: z.string().min(1, "Date of birth is required"),
  sharePct: z
    .number({ error: "Share is required" })
    .int("Whole numbers only")
    .min(1, "Min 1%")
    .max(100, "Max 100%"),
});

export type AddNomineeValues = z.infer<typeof addNomineeSchema>;
