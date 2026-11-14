import { Platform } from "react-native";

/**
 * Thin wrapper over expo-notifications so the rest of the app never touches it directly.
 * On web (and anywhere the module is missing) every call quietly does nothing, which keeps
 * the browser preview working. Reminders still show up in the in-app inbox either way.
 */
type Mod = typeof import("expo-notifications");

let cached: Mod | null | undefined;
function mod(): Mod | null {
  if (cached !== undefined) return cached;
  if (Platform.OS === "web") {
    cached = null;
    return cached;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cached = require("expo-notifications") as Mod;
  } catch {
    cached = null;
  }
  return cached;
}

export type Permission = "granted" | "denied" | "unavailable";

const CHANNEL = "reminders";
/** Server-sent notifications (bookings, cases, articles). The backend sends with channelId "updates". */
const UPDATES = "updates";
let configured = false;

/** Call once at start-up: show notifications while the app is open, and create the Android channel. */
export async function configureNotifications(): Promise<void> {
  const N = mod();
  if (!N || configured) return;
  configured = true;
  try {
    N.setNotificationHandler({
      handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
    });
    if (Platform.OS === "android") {
      // PUBLIC: shown in full on the lock screen. HIGH/MAX: pops up as a banner with sound.
      await N.setNotificationChannelAsync(CHANNEL, {
        name: "Reminders",
        importance: N.AndroidImportance.HIGH,
        lightColor: "#7C5CE0",
        lockscreenVisibility: N.AndroidNotificationVisibility.PUBLIC,
        vibrationPattern: [0, 250, 250, 250],
        sound: "default",
      });
      await N.setNotificationChannelAsync(UPDATES, {
        name: "Bookings, cases and news",
        importance: N.AndroidImportance.MAX,
        lightColor: "#7C5CE0",
        lockscreenVisibility: N.AndroidNotificationVisibility.PUBLIC,
        vibrationPattern: [0, 250, 250, 250],
        sound: "default",
      });
    }
  } catch {
    // Not fatal: reminders just will not pop up.
  }
}

/** Asks the phone for permission the first time; afterwards just reports the answer. */
export async function requestPermission(): Promise<Permission> {
  const N = mod();
  if (!N) return "unavailable";
  try {
    let cur = await N.getPermissionsAsync();
    if (!cur.granted && cur.canAskAgain) cur = await N.requestPermissionsAsync();
    return cur.granted ? "granted" : "denied";
  } catch {
    return "unavailable";
  }
}

export async function hasPermission(): Promise<boolean> {
  const N = mod();
  if (!N) return false;
  try {
    return (await N.getPermissionsAsync()).granted;
  } catch {
    return false;
  }
}

/** Schedules a phone notification for a future moment. Returns its id, or null when it could not be scheduled. */
export async function scheduleAt(at: Date, title: string, body: string, href?: string): Promise<string | null> {
  const N = mod();
  if (!N || at.getTime() <= Date.now() + 5000) return null;
  try {
    return await N.scheduleNotificationAsync({
      content: { title, body, data: href ? { href } : {}, sound: true },
      trigger: { type: N.SchedulableTriggerInputTypes.DATE, date: at, channelId: CHANNEL },
    });
  } catch {
    return null;
  }
}

/** Shows a notification right now (used when the app notices a booking was confirmed). */
export async function notifyNow(title: string, body: string, href?: string): Promise<void> {
  const N = mod();
  if (!N) return;
  try {
    if (!(await hasPermission())) return;
    await N.scheduleNotificationAsync({
      content: { title, body, data: href ? { href } : {}, sound: true },
      trigger: Platform.OS === "android" ? { channelId: UPDATES } : null,
    });
  } catch {
    // ignore
  }
}

export async function cancelScheduled(id: string | undefined): Promise<void> {
  const N = mod();
  if (!N || !id) return;
  try {
    await N.cancelScheduledNotificationAsync(id);
  } catch {
    // ignore
  }
}

/** A notification that opened the app from closed: the splash opens it once it has decided where to go. */
let launchHref: string | null = null;
let launchChecked = false;

/** Returns (once) the screen a tapped notification asked for when it launched the app. */
export async function takeLaunchHref(): Promise<string | null> {
  const N = mod();
  if (!N) return null;
  if (!launchChecked) {
    launchChecked = true;
    try {
      const res = await N.getLastNotificationResponseAsync();
      const data = res?.notification.request.content.data as { href?: unknown } | undefined;
      if (data && typeof data.href === "string") launchHref = data.href;
      await N.clearLastNotificationResponseAsync();
    } catch {
      // ignore
    }
  }
  const h = launchHref;
  launchHref = null;
  return h;
}

/** Runs `onOpen(href)` when the person taps a notification while the app is running. Returns an unsubscribe. */
export function listenForTaps(onOpen: (href: string) => void): () => void {
  const N = mod();
  if (!N) return () => undefined;
  try {
    const sub = N.addNotificationResponseReceivedListener((res) => {
      // The launch tap is handled by the splash (takeLaunchHref).
      if (!launchChecked) return;
      const data = res?.notification.request.content.data as { href?: unknown } | undefined;
      if (data && typeof data.href === "string") onOpen(data.href);
    });
    return () => sub.remove();
  } catch {
    return () => undefined;
  }
}

// ---- Push (server-sent) notifications ----------------------------------------------------------

let pushToken: string | null = null;
/** Why the last getPushToken() returned null (shown on the profile screen). */
let pushProblem: string | null = null;
export function lastPushProblem(): string | null {
  return pushProblem;
}

/**
 * Asks permission (if not asked yet) and returns this phone's Expo push token, or null when push is not
 * possible: web, Expo Go (no push since SDK 53 — use a development or store build), permission refused,
 * or Firebase not set up in the build (android.googleServicesFile).
 */
export async function getPushToken(): Promise<string | null> {
  const N = mod();
  if (!N) {
    pushProblem = "Phone notifications only work in the phone app, not on the web.";
    return null;
  }
  if (pushToken) return pushToken;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const C = require("expo-constants") as typeof import("expo-constants");
    const Constants = C.default;
    if (Constants.executionEnvironment === C.ExecutionEnvironment.StoreClient) {
      pushProblem = "You are using Expo Go, which cannot receive phone notifications. Install the Bloom development build.";
      return null;
    }
    await configureNotifications();
    if ((await requestPermission()) !== "granted") {
      pushProblem = "Notifications are turned off for Bloom. Turn them on in the phone's Settings > Apps > Bloom > Notifications.";
      return null;
    }
    const projectId: string | undefined = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) {
      pushProblem = "The app has no EAS project ID (app.json > extra.eas.projectId). Rebuild after running eas init.";
      return null;
    }
    const res = await N.getExpoPushTokenAsync({ projectId });
    pushToken = res.data || null;
    pushProblem = pushToken ? null : "The phone did not return a push token.";
    return pushToken;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    pushProblem = /Expo Go|development build/i.test(msg)
      ? "You are using Expo Go, which cannot receive phone notifications. Install the Bloom development build and open the app with it."
      : /FirebaseApp|google-services|FCM|Firebase/i.test(msg)
      ? "Firebase is not set up in this build. Add android.googleServicesFile to app.json and build again."
      : `Could not get a push token: ${msg}`;
    return null;
  }
}

/** True once this phone's push token has been sent to the server, so the app does not also pop up its own copy. */
let pushActive = false;
export function setPushActive(on: boolean): void {
  pushActive = on;
}
export function isPushActive(): boolean {
  return pushActive;
}

/** Runs `cb(data)` when a notification arrives while the app is open (e.g. to refresh the bell). */
export function onNotificationReceived(cb: (data: Record<string, unknown>) => void): () => void {
  const N = mod();
  if (!N) return () => undefined;
  try {
    const sub = N.addNotificationReceivedListener((n) => cb((n.request.content.data ?? {}) as Record<string, unknown>));
    return () => sub.remove();
  } catch {
    return () => undefined;
  }
}

/** The number on the app icon (iOS, and Android launchers that show it). */
export async function setBadge(n: number): Promise<void> {
  const N = mod();
  if (!N) return;
  try {
    await N.setBadgeCountAsync(Math.max(0, n));
  } catch {
    // ignore
  }
}

// ---- Permission gate ------------------------------------------------------------------------------

/** False on the web and in Expo Go, where phone notifications can't work (nothing to ask for). */
export function pushPossible(): boolean {
  if (!mod()) return false;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const C = require("expo-constants") as typeof import("expo-constants");
    return C.default.executionEnvironment !== C.ExecutionEnvironment.StoreClient;
  } catch {
    return true;
  }
}

/** granted, or whether the phone will still show its own "Allow notifications?" prompt. */
export async function permissionState(): Promise<{ granted: boolean; canAsk: boolean }> {
  const N = mod();
  if (!N) return { granted: true, canAsk: false };
  try {
    const p = await N.getPermissionsAsync();
    return { granted: p.granted, canAsk: p.canAskAgain };
  } catch {
    return { granted: true, canAsk: false };
  }
}

/** Lets the push registration know the person just allowed notifications, so it registers at once. */
const grantedListeners = new Set<() => void>();
export function onPermissionGranted(cb: () => void): () => void {
  grantedListeners.add(cb);
  return () => grantedListeners.delete(cb);
}
export function emitPermissionGranted(): void {
  grantedListeners.forEach((cb) => cb());
}
