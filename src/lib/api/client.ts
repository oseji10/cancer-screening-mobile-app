import { getToken } from "../auth/tokenStorage";
import { config } from "../config";

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type Options = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Send the stored JWT as `Authorization: Bearer ...`. Defaults to true. */
  auth?: boolean;
  signal?: AbortSignal;
};

let onUnauthorized: (() => void) | null = null;

/** The AuthProvider registers a handler here so a 401 signs the user out. */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

function messageFrom(data: unknown, status: number): string {
  if (typeof data === "object" && data !== null && "message" in data) {
    const message = (data as { message: unknown }).message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  return `Request failed (${status})`;
}

export async function apiFetch<T>(
  path: string,
  { method = "GET", body, auth = true, signal }: Options = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  if (auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${config.apiUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    if (response.status === 401 && auth) onUnauthorized?.();
    throw new ApiError(messageFrom(data, response.status), response.status, data);
  }

  return data as T;
}
