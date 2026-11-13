import { getToken } from "../auth/tokenStorage";
import { config } from "../config";

export class ApiError extends Error {
  status: number;
  body: unknown;
  /** Machine-readable reason from the server, e.g. "INVALID_CREDENTIALS". Empty when none. */
  code: string;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
    this.code =
      typeof body === "object" && body !== null && "code" in body && typeof (body as { code: unknown }).code === "string"
        ? (body as { code: string }).code
        : "";
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

/** Laravel validation answers { message, errors: { field: ["..."] } }: show the first real reason. */
function messageFrom(data: unknown, status: number): string {
  if (typeof data === "object" && data !== null) {
    const errors = (data as { errors?: unknown }).errors;
    if (typeof errors === "object" && errors !== null) {
      for (const value of Object.values(errors as Record<string, unknown>)) {
        if (Array.isArray(value) && typeof value[0] === "string") return value[0];
      }
    }
    const message = (data as { message?: unknown }).message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  if (status >= 500) return "Something went wrong on our side. Please try again shortly.";
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

  let response: Response;
  try {
    response = await fetch(`${config.apiUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    // fetch only rejects when there is no usable connection.
    throw new ApiError("No connection. Check your internet and try again.", 0, null);
  }

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

/** Plain-language message for any thrown value, for showing under a form. */
export function errorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : "Something went wrong. Please try again.";
}
