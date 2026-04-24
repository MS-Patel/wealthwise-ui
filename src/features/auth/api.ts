import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { env } from "@/config/env";
import type { AuthTokens } from "@/types/api";
import type {
  ForgotPasswordPayload,
  LoginCredentials,
  OtpLoginPayload,
  PasswordChangePayload,
  PasswordResetPayload,
  User,
} from "@/types/auth";

/**
 * Auth API surface (B2C investor portal — single role).
 *
 * NOTE: While VITE_USE_MOCK_API is enabled (default in development), all
 * functions resolve with deterministic mock data.
 */

const MOCK_INVESTOR: User = {
  id: "usr_investor_001",
  email: "investor@buybestfin.dev",
  fullName: "Aanya Sharma",
  role: "investor",
  kycStatus: "verified",
  phone: "+91 98765 43210",
  createdAt: "2023-04-12T10:00:00Z",
};

const MOCK_TOKENS: AuthTokens = {
  access: "mock.access.token",
  refresh: "mock.refresh.token",
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface AuthResult {
  user: User;
  tokens: AuthTokens;
}

export interface SignupPayload {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    if (env.USE_MOCK_API) {
      await wait(700);
      if (credentials.password.length < 6) {
        throw Object.assign(new Error("Invalid email or password"), { status: 401 });
      }
      return { user: { ...MOCK_INVESTOR, email: credentials.email }, tokens: MOCK_TOKENS };
    }
    return api.post<AuthResult, LoginCredentials>("/auth/login/", credentials);
  },

  async signup(payload: SignupPayload): Promise<AuthResult> {
    if (env.USE_MOCK_API) {
      await wait(900);
      const user: User = {
        ...MOCK_INVESTOR,
        id: `usr_investor_${Date.now()}`,
        email: payload.email,
        fullName: payload.fullName,
        phone: payload.mobile,
        kycStatus: "not_started",
        createdAt: new Date().toISOString(),
      };
      return { user, tokens: MOCK_TOKENS };
    }
    return api.post<AuthResult, SignupPayload>("/auth/signup/", payload);
  },

  async loginWithOtp(payload: OtpLoginPayload): Promise<AuthResult> {
    if (env.USE_MOCK_API) {
      await wait(700);
      if (payload.otp !== "123456") {
        throw Object.assign(new Error("Invalid OTP. Use 123456 in mock mode."), { status: 401 });
      }
      return { user: MOCK_INVESTOR, tokens: MOCK_TOKENS };
    }
    return api.post<AuthResult, OtpLoginPayload>("/auth/otp/verify/", payload);
  },

  async requestOtp(identifier: string): Promise<{ sent: true }> {
    if (env.USE_MOCK_API) {
      await wait(500);
      return { sent: true };
    }
    return api.post("/auth/otp/request/", { identifier });
  },

  async forgotPassword(payload: ForgotPasswordPayload): Promise<{ sent: true }> {
    if (env.USE_MOCK_API) {
      await wait(600);
      return { sent: true };
    }
    return api.post("/auth/password/reset/", payload);
  },

  async logout(): Promise<void> {
    if (env.USE_MOCK_API) {
      await wait(150);
      return;
    }
    await api.post("/auth/logout/");
  },

  async changePassword(payload: PasswordChangePayload): Promise<{ ok: true }> {
    if (env.USE_MOCK_API) {
      await wait(700);
      // Mock: accept "password123" as the current password.
      if (payload.currentPassword !== "password123") {
        throw Object.assign(new Error("Current password is incorrect"), { status: 400 });
      }
      return { ok: true };
    }
    return api.post("/auth/password/change/", payload);
  },

  async resetPassword(payload: PasswordResetPayload): Promise<{ ok: true }> {
    if (env.USE_MOCK_API) {
      await wait(700);
      if (!payload.token) {
        throw Object.assign(new Error("Invalid or expired reset token"), { status: 400 });
      }
      return { ok: true };
    }
    return api.post("/auth/password/reset/confirm/", payload);
  },
};

/* ─── React Query hooks ─────────────────────────────────────────────── */

export function useLoginMutation() {
  return useMutation({ mutationFn: (c: LoginCredentials) => authApi.login(c) });
}

export function useSignupMutation() {
  return useMutation({ mutationFn: (p: SignupPayload) => authApi.signup(p) });
}

export function useOtpLoginMutation() {
  return useMutation({ mutationFn: (p: OtpLoginPayload) => authApi.loginWithOtp(p) });
}

export function useRequestOtpMutation() {
  return useMutation({ mutationFn: (identifier: string) => authApi.requestOtp(identifier) });
}

export function useForgotPasswordMutation() {
  return useMutation({ mutationFn: (p: ForgotPasswordPayload) => authApi.forgotPassword(p) });
}

export function useLogoutMutation() {
  return useMutation({ mutationFn: () => authApi.logout() });
}

export function useChangePasswordMutation() {
  return useMutation({ mutationFn: (p: PasswordChangePayload) => authApi.changePassword(p) });
}

export function useResetPasswordMutation() {
  return useMutation({ mutationFn: (p: PasswordResetPayload) => authApi.resetPassword(p) });
}
