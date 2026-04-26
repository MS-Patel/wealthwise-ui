import { z } from "zod";

const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

export const panVerifySchema = z.object({
  pan: z
    .string()
    .trim()
    .toUpperCase()
    .regex(panRegex, "Invalid PAN format (e.g. ABCDE1234F)"),
  fullName: z.string().trim().min(2, "Enter the full name on PAN").max(100),
  dob: z.string().min(1, "Date of birth is required"),
});

export const ndmlStatusSchema = z.object({
  pan: z
    .string()
    .trim()
    .toUpperCase()
    .regex(panRegex, "Invalid PAN format (e.g. ABCDE1234F)"),
});

export type PanVerifyValues = z.infer<typeof panVerifySchema>;
export type NdmlStatusValues = z.infer<typeof ndmlStatusSchema>;
