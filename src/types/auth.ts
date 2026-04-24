export type UserRole = "investor";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  kycStatus?: "pending" | "verified" | "rejected" | "not_started";
  phone?: string;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface OtpLoginPayload {
  identifier: string;
  otp: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface PasswordChangePayload {
  currentPassword: string;
  newPassword: string;
}

export interface PasswordResetPayload {
  token: string;
  newPassword: string;
}
