import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

import { getItem, removeItem, setItem } from "../storage/localStore";

/**
 * Fingerprint / Face ID sign-in and app unlock.
 *
 * The phone checks the fingerprint or face (expo-local-authentication); only after it passes do we read the
 * saved sign-in details from the phone's secure store (Android Keystore / iOS Keychain) and sign in with the
 * normal API. The fingerprint or face never leaves the phone. Works with any biometric the phone accepts
 * (fingerprint, face unlock, iris) and falls back to the phone's PIN/pattern after too many failed tries.
 */
export type BiometricScope = "client" | "chw";
export type SavedLogin = { login: string; password: string };

const secretKey = (s: BiometricScope) => `bloom_bio_${s}_secret`;
const flagKey = (s: BiometricScope) => `bloom_bio_${s}_on`;

let supportedCache: boolean | null = null;
let faceOnly = false;

/** True on a phone with biometrics set up. Always false on the web. */
export async function biometricAvailableAsync(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  if (supportedCache !== null) return supportedCache;
  try {
    const [hw, enrolled, types] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
      LocalAuthentication.supportedAuthenticationTypesAsync(),
    ]);
    faceOnly =
      types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION) &&
      !types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);
    supportedCache = hw && enrolled;
  } catch {
    supportedCache = false;
  }
  return supportedCache;
}

/** Cached answer (false until biometricAvailableAsync has run once). Prefer the hook in components. */
export const biometricAvailable = () => supportedCache === true;

/** React hook: whether biometrics can be used on this phone (false while checking). */
export function useBiometricSupported(): boolean {
  const [ok, setOk] = useState(supportedCache === true);
  useEffect(() => {
    let alive = true;
    void biometricAvailableAsync().then((v) => alive && setOk(v));
    return () => {
      alive = false;
    };
  }, []);
  return ok;
}

/** What to call it in text. */
export function biometricLabel(): string {
  if (Platform.OS === "ios") return faceOnly ? "Face ID" : "Face ID or Touch ID";
  return faceOnly ? "face unlock" : "fingerprint";
}

/** Shows the phone's fingerprint / face prompt. True when it passed. */
export async function verifyBiometric(promptMessage: string): Promise<boolean> {
  if (!(await biometricAvailableAsync())) return false;
  try {
    const res = await LocalAuthentication.authenticateAsync({ promptMessage, cancelLabel: "Cancel", disableDeviceFallback: false });
    return res.success;
  } catch {
    return false;
  }
}

export async function biometricEnabled(scope: BiometricScope): Promise<boolean> {
  if (!(await biometricAvailableAsync())) return false;
  try {
    return (await getItem(flagKey(scope))) === "1";
  } catch {
    return false;
  }
}

/** Confirms with the fingerprint, then saves the sign-in details in the secure store. */
export async function enableBiometric(scope: BiometricScope, saved: SavedLogin): Promise<boolean> {
  if (!(await verifyBiometric("Confirm to turn on quick sign-in"))) return false;
  try {
    await SecureStore.setItemAsync(secretKey(scope), JSON.stringify(saved));
    await setItem(flagKey(scope), "1");
    return true;
  } catch {
    return false;
  }
}

export async function disableBiometric(scope: BiometricScope): Promise<void> {
  await removeItem(flagKey(scope)).catch(() => undefined);
  if (Platform.OS === "web") return;
  await SecureStore.deleteItemAsync(secretKey(scope)).catch(() => undefined);
}

/** Fingerprint prompt, then the saved details. null = cancelled/failed; "reset" = nothing saved any more. */
export async function unlockWithBiometric(scope: BiometricScope): Promise<SavedLogin | null | "reset"> {
  if (!(await verifyBiometric("Sign in to Bloom"))) return null;
  try {
    const raw = await SecureStore.getItemAsync(secretKey(scope));
    if (!raw) {
      await disableBiometric(scope);
      return "reset";
    }
    return JSON.parse(raw) as SavedLogin;
  } catch {
    await disableBiometric(scope);
    return "reset";
  }
}

// The password typed at sign-in, held in memory only, so the "turn on quick sign-in?" screen can save it.
let pending: { scope: BiometricScope; saved: SavedLogin } | null = null;
export const setPendingLogin = (scope: BiometricScope, saved: SavedLogin) => {
  pending = { scope, saved };
};
export const takePendingLogin = (scope: BiometricScope): SavedLogin | null => {
  const p = pending && pending.scope === scope ? pending.saved : null;
  pending = null;
  return p;
};

// "Not now" on the home/dashboard reminder card is remembered so it isn't shown again.
const nudgeKey = (s: BiometricScope) => `bloom_bio_${s}_nudge_off`;
export async function shouldNudge(scope: BiometricScope): Promise<boolean> {
  if (!(await biometricAvailableAsync())) return false;
  if (await biometricEnabled(scope)) return false;
  try {
    return (await getItem(nudgeKey(scope))) !== "1";
  } catch {
    return true;
  }
}
export const dismissNudge = (scope: BiometricScope) => setItem(nudgeKey(scope), "1").catch(() => undefined);

export const hasPendingLogin = (scope: BiometricScope) => !!pending && pending.scope === scope;
