import { config } from "../config";
import { apiFetch } from "./client";

const base = config.bloomPath;

export type Need = "breast-health" | "screening" | "appointment" | "community";

export type Account = {
  id: number;
  name: string;
  /** Local format, e.g. 08031234567. */
  phone: string;
  email: string | null;
  age: number | null;
  need: Need | null;
  phoneVerified: boolean;
  createdAt: string | null;
};

export type SignedIn = { access_token: string; expires_in: number; user: Account };

export type CodeSent = {
  message: string;
  phone?: string;
  /** Masked address the code went to, e.g. a***@gmail.com. */
  email?: string;
  otp_expires_in?: number;
  /** Only present when the server runs with BLOOM_OTP_DEBUG=true (staging). */
  debug_code?: string;
};

export const register = (body: { name: string; phone: string; email: string; password: string; age?: number | null; need?: Need | null }) =>
  apiFetch<CodeSent>(`${base}/auth/register`, { method: "POST", body, auth: false });

export const verifyPhone = (phone: string, code: string) =>
  apiFetch<SignedIn>(`${base}/auth/verify`, { method: "POST", body: { phone, code }, auth: false });

export const resendCode = (phone: string) =>
  apiFetch<CodeSent>(`${base}/auth/resend`, { method: "POST", body: { phone }, auth: false });

export const login = (phone: string, password: string) =>
  apiFetch<SignedIn>(`${base}/auth/login`, { method: "POST", body: { phone, password }, auth: false });

export const forgotPassword = (phone: string) =>
  apiFetch<CodeSent>(`${base}/auth/forgot`, { method: "POST", body: { phone }, auth: false });

export const resetPassword = (phone: string, code: string, password: string) =>
  apiFetch<SignedIn>(`${base}/auth/reset`, { method: "POST", body: { phone, code, password }, auth: false });

export const fetchMe = () => apiFetch<{ user: Account }>(`${base}/auth/me`);

export const logoutRequest = () => apiFetch<unknown>(`${base}/auth/logout`, { method: "POST" });

export const updateProfile = (patch: { name?: string; age?: number | null; need?: Need | null }) =>
  apiFetch<{ user: Account }>(`${base}/profile`, { method: "PATCH", body: patch });

export const deleteAccount = (password: string) =>
  apiFetch<unknown>(`${base}/account`, { method: "DELETE", body: { password } });
