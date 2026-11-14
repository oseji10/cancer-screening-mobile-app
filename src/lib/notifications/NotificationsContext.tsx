import { Href, useRouter } from "expo-router";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";

import { getItem, setItem } from "../storage/localStore";
import { useAuth } from "../auth/AuthContext";
import { useProfile } from "../profile/ProfileContext";
import { getRole } from "../role";
import { cancelScheduled, configureNotifications, isPushActive, listenForTaps, notifyNow, onNotificationReceived, onPermissionGranted, Permission, requestPermission, scheduleAt, setBadge } from "./native";
import { pushStatus, registerWomanPush } from "./push";

const KEY = "bloom_notifs_v1";
const MAX_ITEMS = 40;

export type NotifKind = "appointment" | "sbe" | "mammogram" | "change" | "booking" | "news";

/** One entry in the bell inbox. A future `at` means a reminder that has not fired yet. */
export type NotifItem = {
  key: string;
  kind: NotifKind;
  title: string;
  body: string;
  /** ISO time the notification is due (or was created). */
  at: string;
  href?: string;
  /** Id of the phone notification scheduled for it, so it can be cancelled or replaced. */
  osId?: string;
};

type Prefs = { sbe: boolean; mammogram: boolean };
type Stored = { items: NotifItem[]; lastSeenAt: string | null; prefs: Prefs };
const EMPTY: Stored = { items: [], lastSeenAt: null, prefs: { sbe: false, mammogram: false } };

export type ReminderInput = { key: string; kind: NotifKind; at: Date; title: string; body: string; href?: string };

type Ctx = {
  /** Notifications that are due (newest first). */
  items: NotifItem[];
  unread: number;
  markAllRead: () => void;
  prefs: Prefs;
  /** True when the phone has shown (or may show) pop-up reminders. Null until checked. */
  lastPermission: Permission | null;
  /** Schedules (or replaces) a reminder. Returns whether the phone will pop it up or it will only be in the inbox. */
  setReminder: (r: ReminderInput) => Promise<"phone" | "inbox">;
  clearReminder: (key: string) => void;
  hasReminder: (key: string) => boolean;
  /** ISO time a reminder is set for, if it exists. */
  reminderAt: (key: string) => string | undefined;
  /** Adds something that just happened (e.g. booking confirmed) to the inbox and pops it up now. */
  addEvent: (e: { key: string; kind: NotifKind; title: string; body: string; href?: string }) => void;
  /** Turns the monthly self-exam / yearly mammogram reminders on or off. `from` is when the cycle starts (default now). */
  setCycle: (kind: "sbe" | "mammogram", on: boolean, from?: Date) => Promise<"phone" | "inbox">;
  /** Asks the phone for permission to show notifications. */
  askPermission: () => Promise<Permission>;
};

const NotificationsContext = createContext<Ctx | null>(null);

const NINE_AM = 9;
function atNine(d: Date): Date {
  const x = new Date(d);
  x.setHours(NINE_AM, 0, 0, 0);
  return x;
}
/** Same day next month (clamped to the 28th so every month has it) at 9am. */
function monthsAhead(from: Date, n: number): Date {
  const d = new Date(from.getFullYear(), from.getMonth() + n, Math.min(from.getDate(), 28));
  return atNine(d);
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<Stored>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [tick, setTick] = useState(0);
  const [lastPermission, setLastPermission] = useState<Permission | null>(null);
  const ref = useRef(state);
  ref.current = state;

  const save = useCallback((next: Stored) => {
    ref.current = next;
    setState(next);
    void setItem(KEY, JSON.stringify(next)).catch(() => undefined);
  }, []);

  useEffect(() => {
    let alive = true;
    void configureNotifications();
    (async () => {
      try {
        const raw = await getItem(KEY);
        if (raw && alive) {
          const parsed = JSON.parse(raw) as Partial<Stored>;
          const next = { ...EMPTY, ...parsed, prefs: { ...EMPTY.prefs, ...(parsed.prefs ?? {}) } };
          ref.current = next;
          setState(next);
        }
      } catch {
        // start empty
      }
      if (alive) setLoaded(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Re-check what is due once a minute while the app is open.
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  // Server-sent notifications: register this phone once she has set Bloom up, and again when she signs
  // in or out (so booking updates follow her account). Skipped on a health worker's phone.
  const { token: authToken } = useAuth();
  const { onboarded } = useProfile();
  // Also tried again each time the app comes back to the front while it is still off (e.g. she just
  // allowed notifications in the phone's settings), so nobody has to press anything.
  useEffect(() => {
    if (!onboarded) return;
    let alive = true;
    const attempt = async () => {
      if ((await getRole()) === "chw" || !alive) return;
      await registerWomanPush();
    };
    void attempt();
    const sub = AppState.addEventListener("change", (st) => {
      if (st === "active" && !pushStatus().ok) void attempt();
    });
    const off = onPermissionGranted(() => void attempt());
    return () => {
      alive = false;
      sub.remove();
      off();
    };
  }, [onboarded, authToken]);

  // Tapping a phone notification opens the right screen.
  useEffect(() => listenForTaps((href) => router.push(href as Href)), [router]);

  const upsert = useCallback(
    (item: NotifItem) => {
      const cur = ref.current;
      const rest = cur.items.filter((i) => i.key !== item.key);
      // Keep the inbox small: drop the oldest delivered items first.
      const items = [item, ...rest]
        .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
        .slice(0, MAX_ITEMS);
      save({ ...cur, items });
    },
    [save],
  );

  const clearReminder = useCallback(
    (key: string) => {
      const cur = ref.current;
      const found = cur.items.find((i) => i.key === key);
      if (!found) return;
      void cancelScheduled(found.osId);
      save({ ...cur, items: cur.items.filter((i) => i.key !== key) });
    },
    [save],
  );

  const setReminder = useCallback(
    async (r: ReminderInput): Promise<"phone" | "inbox"> => {
      const existing = ref.current.items.find((i) => i.key === r.key);
      if (existing) await cancelScheduled(existing.osId);
      const perm = await requestPermission();
      setLastPermission(perm);
      const osId = perm === "granted" ? await scheduleAt(r.at, r.title, r.body, r.href) : null;
      upsert({ key: r.key, kind: r.kind, title: r.title, body: r.body, at: r.at.toISOString(), href: r.href, osId: osId ?? undefined });
      return osId ? "phone" : "inbox";
    },
    [upsert],
  );

  const hasReminder = useCallback((key: string) => ref.current.items.some((i) => i.key === key), []);
  const reminderAt = useCallback((key: string) => ref.current.items.find((i) => i.key === key)?.at, []);

  const addEvent = useCallback<Ctx["addEvent"]>(
    (e) => {
      upsert({ key: e.key, kind: e.kind, title: e.title, body: e.body, at: new Date().toISOString(), href: e.href });
      // With push on, the server already put booking news on the phone (and lock screen); don't show it twice.
      if (!(isPushActive() && e.kind === "booking")) void notifyNow(e.title, e.body, e.href);
    },
    [upsert],
  );

  // An article/announcement pushed while the app is open also goes into the bell inbox.
  useEffect(
    () =>
      onNotificationReceived((data) => {
        if (typeof data.postId !== "number" && typeof data.postId !== "string") return;
        const title = typeof data.title === "string" && data.title ? data.title : "New from Bloom";
        upsert({ key: `post-${data.postId}`, kind: "news", title, body: "Tap to read it.", at: new Date().toISOString(), href: typeof data.href === "string" ? data.href : undefined });
      }),
    [upsert],
  );

  const applyCycle = useCallback(
    async (kind: "sbe" | "mammogram", from: Date): Promise<"phone" | "inbox"> => {
      let mode: "phone" | "inbox" = "inbox";
      if (kind === "sbe") {
        // The next six monthly check-ins; topped up each time the app opens.
        for (let n = 1; n <= 6; n++) {
          const when = monthsAhead(from, n);
          const key = `sbe-${when.getFullYear()}-${when.getMonth() + 1}`;
          if (when.getTime() <= Date.now()) continue;
          if (ref.current.items.some((i) => i.key === key && i.osId)) continue;
          const res = await setReminder({
            key,
            kind: "sbe",
            at: when,
            title: "Time for your monthly breast self-check",
            body: "It only takes a few minutes. Tap to start and log it.",
            href: "/change-tracker",
          });
          if (res === "phone") mode = "phone";
        }
      } else {
        const when = atNine(new Date(from.getFullYear() + 1, from.getMonth(), Math.min(from.getDate(), 28)));
        mode = await setReminder({
          key: "mammogram",
          kind: "mammogram",
          at: when,
          title: "Time to book your mammogram",
          body: "It has been a year since your last screening. Tap to find a centre near you.",
          href: "/find",
        });
      }
      return mode;
    },
    [setReminder],
  );

  const setCycle = useCallback<Ctx["setCycle"]>(
    async (kind, on, from = new Date()) => {
      const cur = ref.current;
      save({ ...cur, prefs: { ...cur.prefs, [kind]: on } });
      if (!on) {
        for (const i of ref.current.items.filter((x) => (kind === "sbe" ? x.key.startsWith("sbe-") : x.key === "mammogram") && new Date(x.at).getTime() > Date.now())) {
          clearReminder(i.key);
        }
        return "inbox";
      }
      return applyCycle(kind, from);
    },
    [applyCycle, clearReminder, save],
  );

  // Keep the monthly self-check topped up while the preference is on.
  const toppedUp = useRef(false);
  useEffect(() => {
    if (!loaded || toppedUp.current) return;
    toppedUp.current = true;
    if (ref.current.prefs.sbe) void applyCycle("sbe", new Date());
  }, [loaded, applyCycle]);

  const askPermission = useCallback(async () => {
    const p = await requestPermission();
    setLastPermission(p);
    return p;
  }, []);

  const markAllRead = useCallback(() => {
    const cur = ref.current;
    save({ ...cur, lastSeenAt: new Date().toISOString() });
  }, [save]);

  // Number on the app icon = unread bell items.
  useEffect(() => {
    const now = Date.now();
    const seen = state.lastSeenAt ? new Date(state.lastSeenAt).getTime() : 0;
    void setBadge(state.items.filter((i) => { const t = new Date(i.at).getTime(); return t <= now && t > seen; }).length);
  }, [state, tick]);

  const value = useMemo<Ctx>(() => {
    const now = Date.now();
    const due = state.items.filter((i) => new Date(i.at).getTime() <= now);
    const seen = state.lastSeenAt ? new Date(state.lastSeenAt).getTime() : 0;
    return {
      items: due,
      unread: due.filter((i) => new Date(i.at).getTime() > seen).length,
      markAllRead,
      prefs: state.prefs,
      lastPermission,
      setReminder,
      clearReminder,
      hasReminder,
      reminderAt,
      addEvent,
      setCycle,
      askPermission,
    };
    // `tick` makes reminders that just became due appear without a reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, tick, lastPermission, markAllRead, setReminder, clearReminder, hasReminder, reminderAt, addEvent, setCycle, askPermission]);

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications(): Ctx {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationsProvider");
  return ctx;
}

export { atNine };
