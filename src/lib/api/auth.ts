import { config } from "../config";
import { apiFetch } from "./client";

// Tymon JWT usually answers { access_token, token_type, expires_in }, but
// Laravel controllers often wrap it, so accept the common shapes.
type LoginResponse = {
  access_token?: string;
  token?: string;
  data?: { access_token?: string; token?: string };
};

export function extractToken(response: LoginResponse): string | null {
  return (
    response.access_token ?? response.token ?? response.data?.access_token ?? response.data?.token ?? null
  );
}

export async function login(email: string, password: string): Promise<string> {
  const response = await apiFetch<LoginResponse>(config.loginPath, {
    method: "POST",
    body: { email, password },
    auth: false,
  });

  const token = extractToken(response);
  if (!token) throw new Error("Login succeeded but no token was returned by the server.");
  return token;
}
