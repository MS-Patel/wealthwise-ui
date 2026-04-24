import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});

export const otpRequestSchema = z.object({
  identifier: z.string().min(6, "Enter your email or mobile number"),
});

export const otpVerifySchema = otpRequestSchema.extend({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});

export const signupSchema = z
  .object({
    fullName: z.string().min(3, "Enter your full name"),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    mobile: z
      .string()
      .min(10, "Enter a valid 10-digit mobile")
      .max(15, "Mobile too long")
      .regex(/^[+0-9 -]+$/, "Digits only"),
    password: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string(),
    agreeTerms: z.literal(true, { error: "You must agree to continue" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type OtpRequestFormValues = z.infer<typeof otpRequestSchema>;
export type OtpVerifyFormValues = z.infer<typeof otpVerifySchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must differ from current",
    path: ["newPassword"],
  });

export const passwordResetSchema = z
  .object({
    token: z.string().min(1, "Reset token missing"),
    newPassword: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;
export type PasswordResetFormValues = z.infer<typeof passwordResetSchema>;
