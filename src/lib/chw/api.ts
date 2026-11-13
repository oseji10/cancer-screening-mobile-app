import { ApiError } from "../api/client";
import { config } from "../config";
import { getItem, removeItem, setItem } from "../storage/localStore";

/**
 * Health workers sign in with their normal NCSR account (POST /auth/login), so their token is
 * an NCSR staff token. It is kept apart from the Bloom (client) token on purpose.
 */
const TOKEN_KEY = "bloom_chw_token_v1";
const USER_KEY = "bloom_chw_user_v1";

export type ChwUser = { id: number; firstName: string; lastName: string; email: string; phone: string | null; role: string | null; facilityName: string | null };

export async function loadSession(): Promise<{ token: string; user: ChwUser } | null> {
  try {
    const [token, raw] = await Promise.all([getItem(TOKEN_KEY), getItem(USER_KEY)]);
    return token && raw ? { token, user: JSON.parse(raw) as ChwUser } : null;
  } catch {
    return null;
  }
}

export async function saveSession(token: string, user: ChwUser): Promise<void> {
  await setItem(TOKEN_KEY, token);
  await setItem(USER_KEY, JSON.stringify(user));
}

export async function clearSession(): Promise<void> {
  await Promise.all([removeItem(TOKEN_KEY).catch(() => undefined), removeItem(USER_KEY).catch(() => undefined)]);
}

function firstMessage(data: unknown, status: number): string {
  if (typeof data === "object" && data !== null) {
    const errors = (data as { errors?: Record<string, unknown> }).errors;
    if (errors) {
      for (const v of Object.values(errors)) if (Array.isArray(v) && typeof v[0] === "string") return v[0];
    }
    const m = (data as { message?: unknown }).message;
    if (typeof m === "string" && m) return m;
  }
  return status >= 500 ? "Something went wrong on our side. Please try again shortly." : `Request failed (${status})`;
}

export async function chwFetch<T>(path: string, opts: { method?: "GET" | "POST" | "PATCH" | "DELETE"; body?: unknown; token?: string | null } = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
  let res: Response;
  try {
    res = await fetch(`${config.apiUrl}${path}`, { method: opts.method ?? "GET", headers, body: opts.body === undefined ? undefined : JSON.stringify(opts.body) });
  } catch {
    throw new ApiError("No connection. Check your internet and try again.", 0, null);
  }
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) throw new ApiError(firstMessage(data, res.status), res.status, data);
  return data as T;
}

/** Phone numbers are stored as 0XXXXXXXXXX on NCSR accounts made from the app. */
export function toLogin(input: string): string {
  const v = input.trim();
  if (v.includes("@")) return v.toLowerCase();
  const d = v.replace(/\D+/g, "");
  if (d.startsWith("234") && d.length === 13) return `0${d.slice(3)}`;
  if (d.length === 10) return `0${d}`;
  return d || v;
}

type LoginResponse = {
  access_token: string;
  user: { id: number; firstName: string; lastName: string; email: string; phoneNumber: string | null; role: string | null; facility: { facilityName: string } | null };
};

export async function signInRequest(login: string, password: string): Promise<{ token: string; user: ChwUser }> {
  const res = await chwFetch<LoginResponse>("/auth/login", { method: "POST", body: { email: toLogin(login), password } });
  const u = res.user;
  return {
    token: res.access_token,
    user: { id: u.id, firstName: u.firstName, lastName: u.lastName, email: u.email, phone: u.phoneNumber, role: u.role, facilityName: u.facility?.facilityName ?? null },
  };
}

export type Review = { review: "pending" | "approved" | "rejected" | "inactive"; note: string | null; accountActive: boolean };

export async function accountStatus(login: string, password: string): Promise<Review> {
  const res = await chwFetch<{ data: Review }>("/bloom-chw/account-status", { method: "POST", body: { login: toLogin(login), password } });
  return res.data;
}

export type FacilityOption = { id: number; name: string; lga: string | null; state: string | null };

/** All active facilities on NCSR (pass a search term to narrow it down). */
export async function searchFacilities(q = ""): Promise<FacilityOption[]> {
  const res = await chwFetch<{ data: FacilityOption[] }>(`/bloom-chw/facilities${q ? `?search=${encodeURIComponent(q)}` : ""}`);
  return res.data;
}

export async function registerChw(input: { firstName: string; lastName: string; email: string; phone: string; facilityId: number; profession: string; staffId: string; password: string }): Promise<string> {
  const res = await chwFetch<{ message: string }>("/bloom-chw/register", { method: "POST", body: input });
  return res.message;
}

export type CaseDto = {
  id: number;
  code: string;
  ncsrClientId?: string | null;
  stage: string;
  screening: string;
  facility: { id: number; name: string } | null;
  area: string | null;
  requestedAt: string | null;
  appointment: { status: string; date: string | null; time: string | null; confirmedDate: string | null; confirmedTime: string | null } | null;
  client: { name: string; phone: string | null; age: number | null } | null;
  steps: [string, string, string, string];
  outcome: string;
  notes: string | null;
  referralFacility: string | null;
  referralDate: string | null;
  followUpDate: string | null;
  closedAt: string | null;
};
