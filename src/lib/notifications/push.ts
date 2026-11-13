import { Platform } from "react-native";

import { apiFetch } from "../api/client";
import { config } from "../config";
import { getPushToken, lastPushProblem, setPushActive } from "./native";

/**
 * Registers this phone for server-sent notifications.
 * Women: POST /bloom/push-token (with her token when signed in, so booking updates reach her; signed out it
 * still receives articles and announcements). Health workers: POST /bloom-chw/push-token with their staff token.
 */
type Req = <T>(path: string, method?: "GET" | "POST" | "PATCH" | "DELETE", body?: unknown) => Promise<T>;

const platform = Platform.OS === "ios" || Platform.OS === "android" ? Platform.OS : undefined;

/** Result of the last registration attempt, for the "Phone notifications" card on the profile screens. */
export type PushStatus = { ok: boolean; message: string; token: string | null };
let status: PushStatus = { ok: false, message: "Not checked yet.", token: null };
export function pushStatus(): PushStatus {
  return status;
}

function failed(message: string, token: string | null = null): false {
  status = { ok: false, message, token };
  setPushActive(false);
  return false;
}

function serverMessage(e: unknown): string {
  return e instanceof Error ? e.message : "Could not reach the server.";
}

export async function registerWomanPush(): Promise<boolean> {
  if (!config.hasBackend) return failed("The app is not connected to the server (EXPO_PUBLIC_API_URL).");
  const token = await getPushToken();
  if (!token) return failed(lastPushProblem() ?? "This phone cannot receive notifications.");
  try {
    await apiFetch("/bloom/push-token", { method: "POST", body: { token, platform } });
    setPushActive(true);
    status = { ok: true, message: "On. This phone gets booking updates and news.", token };
    return true;
  } catch (e) {
    return failed(`The server did not save this phone: ${serverMessage(e)}`, token);
  }
}

export async function registerChwPush(request: Req): Promise<boolean> {
  if (!config.hasBackend) return failed("The app is not connected to the server (EXPO_PUBLIC_API_URL).");
  const token = await getPushToken();
  if (!token) return failed(lastPushProblem() ?? "This phone cannot receive notifications.");
  try {
    await request("/bloom-chw/push-token", "POST", { token, platform });
    setPushActive(true);
    status = { ok: true, message: "On. This phone gets case updates and news.", token };
    return true;
  } catch (e) {
    return failed(`The server did not save this phone: ${serverMessage(e)}`, token);
  }
}

/** Asks the server to send a test notification to this phone now; returns what happened. */
export async function sendTestPush(): Promise<string> {
  const token = status.token ?? (await getPushToken());
  if (!token) return lastPushProblem() ?? "This phone cannot receive notifications.";
  try {
    const res = await apiFetch<{ message: string }>("/bloom/push-test", { method: "POST", body: { token }, auth: false });
    return res.message;
  } catch (e) {
    return serverMessage(e);
  }
}

/** Health worker signing out (also from the app lock): stop her case notifications on this phone. */
export async function unregisterPush(): Promise<void> {
  setPushActive(false);
  const token = await getPushToken();
  if (!token || !config.hasBackend) return;
  try {
    // Public endpoint: works even after her staff token is gone.
    await apiFetch("/bloom/push-token", { method: "DELETE", body: { token }, auth: false });
  } catch {
    // the server drops it when someone else registers the phone
  }
}
