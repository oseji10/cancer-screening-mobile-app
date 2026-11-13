import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";

import { ApiError } from "../api/client";
import { config } from "../config";
import { getItem, removeItem, setItem } from "../storage/localStore";
import { getNotifications, markNotificationsRead, StaffNotification } from "./access";
import { isPushActive, notifyNow, onNotificationReceived, setBadge } from "../notifications/native";
import { registerChwPush, unregisterPush } from "../notifications/push";
import { CaseDto, chwFetch, ChwUser, clearSession, loadSession, saveSession, signInRequest } from "./api";
import { ChwCase, Outcome, sampleCases, StepStatus } from "./cases";
import { onChwSession } from "./sessionEvents";

/**
 * Live mode (EXPO_PUBLIC_API_URL set): the health worker signs in with their NCSR account and works on
 * real cases from /bloom-chw/cases. Sample mode (no backend): built-in sample cases, no sign-in.
 */
const caseKey = (id: string) => `bloom_chw_case_${id}`;
const STEP_VALUES: StepStatus[] = ["not-started", "in-progress", "completed", "not-needed"];

type Result = string | null; // error message, or null when it worked

type Ctx = {
  live: boolean;
  /** Live mode: the signed-in health worker (null = signed out). Sample mode: always null. */
  user: ChwUser | null;
  ready: boolean;
  cases: ChwCase[];
  loaded: boolean;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  signIn: (login: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  find: (id: string) => ChwCase | undefined;
  startCase: (id: string) => void;
  completeCommunity: (id: string, notes: string) => Promise<Result>;
  completePhc: (id: string, outcome: Exclude<Outcome, "pending">) => Promise<Result>;
  completeReferral: (id: string, facility: string, date: string, facilityId?: number) => Promise<Result>;
  completeFollowUp: (id: string, date: string) => Promise<Result>;
  resetSamples: () => Promise<void>;
  /** Notification bell. */
  notifications: StaffNotification[];
  unread: number;
  refreshNotifications: () => Promise<void>;
  markAllRead: () => Promise<void>;
  /** Calls the NCSR API with the health worker's token (live mode only). */
  request: <T>(path: string, method?: "GET" | "POST" | "PATCH" | "DELETE", body?: unknown) => Promise<T>;
};

const ChwContext = createContext<Ctx | null>(null);

function fromDto(d: CaseDto): ChwCase {
  const steps = d.steps.map((s) => (STEP_VALUES.includes(s as StepStatus) ? (s as StepStatus) : "not-started")) as ChwCase["steps"];
  const a = d.appointment;
  const slotDate = a?.confirmedDate ?? a?.date ?? null;
  const slotTime = a?.confirmedDate ? a.confirmedTime : a?.time;
  return {
    id: d.code,
    serverId: d.id,
    ncsrClientId: d.ncsrClientId ?? null,
    screening: d.screening,
    facility: d.facility?.name ?? "",
    community: d.area ?? d.facility?.name ?? "",
    initiated: (d.requestedAt ?? "").slice(0, 10),
    contact: d.client?.phone ?? "",
    clientName: d.client?.name,
    clientAge: d.client?.age ?? null,
    appointmentStatus: a?.status,
    appointmentSlot: slotDate ? `${slotDate}${slotTime ? ` ${slotTime.slice(0, 5)}` : ""}` : undefined,
    outcome: (["pending", "no-change", "concerning-change"].includes(d.outcome) ? d.outcome : "pending") as Outcome,
    notes: d.notes ?? "",
    referralFacility: d.referralFacility ?? "",
    referralDate: d.referralDate ?? "",
    followUpDate: d.followUpDate ?? "",
    steps,
    closed: !!d.closedAt,
  };
}

export function ChwProvider({ children }: { children: ReactNode }) {
  const live = config.hasBackend;
  const [user, setUser] = useState<ChwUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(!live);
  const [cases, setCases] = useState<ChwCase[]>(live ? [] : sampleCases);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef(cases);
  ref.current = cases;
  const [notifications, setNotifications] = useState<StaffNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const lastNotifId = useRef<number | null>(null);
  const tokenRef = useRef<string | null>(null);
  tokenRef.current = token;

  const signOut = useCallback(async () => {
    void unregisterPush();
    await clearSession();
    setToken(null);
    setUser(null);
    setNotifications([]);
    setUnread(0);
    lastNotifId.current = null;
    if (live) setCases([]);
  }, [live]);

  /** Any call with the staff token; a 401/403 means the session is over (expired or deactivated). */
  const call = useCallback(
    async <T,>(path: string, method: "GET" | "POST" | "PATCH" | "DELETE" = "GET", body?: unknown): Promise<T> => {
      try {
        return await chwFetch<T>(path, { method, body, token: tokenRef.current });
      } catch (e) {
        if (e instanceof ApiError && (e.status === 401 || (e.status === 403 && path === "/bloom-chw/cases"))) await signOut();
        throw e;
      }
    },
    [signOut],
  );

  /** Loads the bell. Items newer than the last check also pop up as a phone notification. */
  const refreshNotifications = useCallback(async () => {
    if (live && !tokenRef.current) return;
    try {
      const res = await getNotifications(live, call);
      const newest = res.items[0]?.id ?? 0;
      // With push on, the server already put these on the phone; only pop up our own copy without it.
      if (lastNotifId.current !== null && !isPushActive()) {
        res.items
          .filter((n) => !n.read && n.id > (lastNotifId.current ?? 0))
          .slice(0, 3)
          .forEach((n) => void notifyNow(n.title, n.body ?? "", "/chw/notifications"));
      }
      lastNotifId.current = Math.max(newest, lastNotifId.current ?? 0);
      setNotifications(res.items);
      setUnread(res.unread);
    } catch {
      // the bell keeps what it had
    }
  }, [live, call]);

  const markAllRead = useCallback(async () => {
    setNotifications((rows) => rows.map((n) => ({ ...n, read: true })));
    setUnread(0);
    try {
      await markNotificationsRead(live, call);
    } catch {
      // next refresh shows the real state
    }
  }, [live, call]);

  const refresh = useCallback(async () => {
    if (!live || !tokenRef.current) return;
    setLoading(true);
    try {
      const res = await call<{ data: CaseDto[] }>("/bloom-chw/cases");
      setCases(res.data.map(fromDto));
      void refreshNotifications();
      setError(null);
      setLoaded(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load cases.");
    } finally {
      setLoading(false);
    }
  }, [live, call, refreshNotifications]);

  // Restore the saved session (live) or the saved sample progress (sample mode).
  useEffect(() => {
    let alive = true;
    (async () => {
      if (live) {
        const s = await loadSession();
        if (!alive) return;
        if (s) {
          tokenRef.current = s.token;
          setToken(s.token);
          setUser(s.user);
        }
        setReady(true);
        return;
      }
      const merged = await Promise.all(
        sampleCases().map(async (c) => {
          try {
            const raw = await getItem(caseKey(c.id));
            return raw ? ({ ...c, ...(JSON.parse(raw) as Partial<ChwCase>) } as ChwCase) : c;
          } catch {
            return c;
          }
        }),
      );
      if (alive) {
        setCases(merged);
        setLoaded(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [live]);

  // The app lock can sign the health worker out, or refresh their token after they unlock with a password.
  useEffect(
    () =>
      onChwSession(async (k) => {
        if (k === "signed-out") {
          tokenRef.current = null;
          setToken(null);
          setUser(null);
          setCases([]);
          setNotifications([]);
          setUnread(0);
          lastNotifId.current = null;
          void unregisterPush();
          return;
        }
        const s = await loadSession();
        if (s) {
          tokenRef.current = s.token;
          setToken(s.token);
          setUser(s.user);
        }
      }),
    [],
  );

  // Signed in: register this phone for case notifications (lock screen included). A notification that
  // arrives while the app is open refreshes the bell and the case list.
  useEffect(() => {
    if (!live || !token) return;
    void registerChwPush(call);
    return onNotificationReceived(() => {
      void refresh();
    });
  }, [live, token, call, refresh]);

  // Number on the app icon = unread bell items.
  useEffect(() => {
    void setBadge(unread);
  }, [unread]);

  // Load cases after sign-in, then again whenever the app comes back to the front.
  // The bell is also checked every minute while the app is open.
  useEffect(() => {
    if (!live) {
      void refreshNotifications();
      return;
    }
    if (!token) return;
    void refresh();
    const sub = AppState.addEventListener("change", (st) => {
      if (st === "active") void refresh();
    });
    const timer = setInterval(() => {
      if (AppState.currentState === "active") void refreshNotifications();
    }, 60_000);
    return () => {
      sub.remove();
      clearInterval(timer);
    };
  }, [live, token, refresh, refreshNotifications]);

  const signIn = useCallback(
    async (login: string, password: string) => {
      const res = await signInRequest(login, password);
      if (res.user.role !== "NAVIGATOR") {
        throw new ApiError("This sign-in is for community health workers. Please use the NCSR web app with this account.", 403, { code: "NOT_NAVIGATOR" });
      }
      await saveSession(res.token, res.user);
      tokenRef.current = res.token;
      setToken(res.token);
      setUser(res.user);
    },
    [],
  );

  /** Sample mode: change locally and remember it on the phone. */
  const updateLocal = useCallback((id: string, fn: (c: ChwCase) => ChwCase) => {
    const next = ref.current.map((c) => (c.id === id ? fn(c) : c));
    ref.current = next;
    setCases(next);
    const changed = next.find((c) => c.id === id);
    if (changed) void setItem(caseKey(id), JSON.stringify(changed)).catch(() => undefined);
  }, []);

  /** Live mode: send a step to the server and swap in the case it returns. */
  const send = useCallback(
    async (id: string, step: string, body?: unknown): Promise<Result> => {
      const c = ref.current.find((x) => x.id === id);
      if (!c?.serverId) return "Case not found.";
      try {
        const res = await call<{ data: CaseDto }>(`/bloom-chw/cases/${c.serverId}/${step}`, "POST", body);
        const updated = fromDto(res.data);
        setCases((rows) => rows.map((r) => (r.id === id ? updated : r)));
        return null;
      } catch (e) {
        return e instanceof Error ? e.message : "Could not save. Please try again.";
      }
    },
    [call],
  );

  const value = useMemo<Ctx>(
    () => ({
      live,
      user,
      ready,
      cases,
      loaded,
      loading,
      error,
      refresh,
      signIn,
      signOut,
      find: (id) => cases.find((c) => c.id === id),
      startCase: (id) => {
        if (live) {
          void send(id, "start");
          return;
        }
        updateLocal(id, (c) => (c.steps[0] === "not-started" ? { ...c, steps: ["in-progress", c.steps[1], c.steps[2], c.steps[3]] } : c));
      },
      completeCommunity: async (id, notes) => {
        if (live) return send(id, "community", { notes });
        updateLocal(id, (c) => ({ ...c, notes, steps: ["completed", c.steps[1] === "not-started" ? "in-progress" : c.steps[1], c.steps[2], c.steps[3]] }));
        return null;
      },
      completePhc: async (id, outcome) => {
        if (live) return send(id, "phc", { outcome });
        updateLocal(id, (c) => ({
          ...c,
          outcome,
          steps: outcome === "concerning-change" ? ["completed", "completed", "in-progress", "not-started"] : ["completed", "completed", "not-needed", "not-needed"],
        }));
        return null;
      },
      completeReferral: async (id, facility, date, facilityId) => {
        if (live) return send(id, "referral", { facility, date, facilityId });
        updateLocal(id, (c) => ({ ...c, referralFacility: facility, referralDate: date, steps: [c.steps[0], c.steps[1], "completed", "in-progress"] }));
        return null;
      },
      completeFollowUp: async (id, date) => {
        if (live) return send(id, "followup", { date });
        updateLocal(id, (c) => ({ ...c, followUpDate: date, steps: [c.steps[0], c.steps[1], c.steps[2], "completed"] }));
        return null;
      },
      request: call,
      notifications,
      unread,
      refreshNotifications,
      markAllRead,
      resetSamples: async () => {
        if (live) return;
        await Promise.all(sampleCases().map((c) => removeItem(caseKey(c.id)).catch(() => undefined)));
        const fresh = sampleCases();
        ref.current = fresh;
        setCases(fresh);
      },
    }),
    [live, user, ready, cases, loaded, loading, error, refresh, signIn, signOut, send, updateLocal, call, notifications, unread, refreshNotifications, markAllRead],
  );

  return <ChwContext.Provider value={value}>{children}</ChwContext.Provider>;
}

export function useChw(): Ctx {
  const ctx = useContext(ChwContext);
  if (!ctx) throw new Error("useChw must be used inside ChwProvider");
  return ctx;
}
