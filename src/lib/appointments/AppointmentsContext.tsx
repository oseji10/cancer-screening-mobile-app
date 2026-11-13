import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";

import { AppointmentDto, cancelAppointment, fetchAppointments, rescheduleAppointment } from "../api/appointments";
import { useAuth } from "../auth/AuthContext";
import { config } from "../config";
import { atNine, useNotifications } from "../notifications/NotificationsContext";
import { getItem, removeItem, setItem } from "../storage/localStore";
import { formatSlot, isLive, slotDate } from "./format";

const SEEN_KEY = "bloom_appt_seen_v1";
const POLL_MS = 60_000;

type Ctx = {
  appointments: AppointmentDto[];
  /** Bookings that are waiting or confirmed, soonest first. */
  live: AppointmentDto[];
  loading: boolean;
  refresh: () => Promise<void>;
  cancel: (id: number) => Promise<void>;
  reschedule: (id: number, date: string, time: string) => Promise<void>;
  /** Reminds the person before this booking (day before and two hours before). Returns "phone" or "inbox". */
  remind: (a: AppointmentDto) => Promise<"phone" | "inbox">;
  hasReminder: (id: number) => boolean;
};

const AppointmentsContext = createContext<Ctx | null>(null);

export const reminderKeys = (id: number | string) => [`appt-${id}-day`, `appt-${id}-soon`];

/** One line that changes whenever staff do something to a booking. */
const fingerprint = (a: AppointmentDto) => [a.status, a.confirmedDate, a.confirmedTime, a.staffNote].join("|");

export function AppointmentsProvider({ children }: { children: ReactNode }) {
  const { signedIn, loading: authLoading } = useAuth();
  const notifs = useNotifications();
  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [loading, setLoading] = useState(false);
  const notifsRef = useRef(notifs);
  notifsRef.current = notifs;
  const busy = useRef(false);

  /** Compare with what the person last saw and tell them about decisions the centre made. */
  const announce = useCallback(async (rows: AppointmentDto[]) => {
    let seen: Record<string, string> = {};
    try {
      const raw = await getItem(SEEN_KEY);
      if (raw) seen = JSON.parse(raw) as Record<string, string>;
    } catch {
      seen = {};
    }
    const next: Record<string, string> = {};
    for (const a of rows) {
      const fp = fingerprint(a);
      next[a.id] = fp;
      const before = seen[a.id];
      if (before === undefined || before === fp) continue; // first sight or unchanged: stay quiet
      const where = a.centre?.name ?? "the centre";
      if (a.status === "confirmed") {
        const [bStatus, bDate, bTime] = before.split("|");
        const hhmm = (t: string | null | undefined) => (t ?? "").slice(0, 5);
        // The centre picked a different day or time from what was asked, or moved a slot it had already confirmed.
        const moved = bStatus === "confirmed" && (bDate !== (a.confirmedDate ?? "") || hhmm(bTime) !== hhmm(a.confirmedTime));
        const differs = bStatus !== "confirmed" && (a.confirmedDate !== a.date || (!!a.time && !!a.confirmedTime && hhmm(a.time) !== hhmm(a.confirmedTime)));
        const note = a.staffNote ? ` Note from the centre: ${a.staffNote.trim().replace(/[.!?]*$/, ".")}` : "";
        notifsRef.current.addEvent(
          moved || differs
            ? {
                key: `appt-${a.id}-rescheduled-${a.confirmedDate}-${a.confirmedTime}`,
                kind: "booking",
                title: "Your appointment was rescheduled",
                body: `${where} has set it for ${formatSlot(a)}.${note} If this time does not work, open Find to change or cancel it.`,
                href: "/find",
              }
            : {
                key: `appt-${a.id}-confirmed-${a.confirmedDate}-${a.confirmedTime}`,
                kind: "booking",
                title: "Your booking is confirmed",
                body: `${where}, ${formatSlot(a)}.${note}`,
                href: "/find",
              },
        );
      } else if (a.status === "declined") {
        notifsRef.current.addEvent({
          key: `appt-${a.id}-declined`,
          kind: "booking",
          title: "The centre could not take your booking",
          body: `${where}: ${a.staffNote ?? "Please pick another day or centre."}`,
          href: "/find",
        });
      } else if (a.status === "completed") {
        notifsRef.current.addEvent({
          key: `appt-${a.id}-completed`,
          kind: "booking",
          title: "Thanks for coming in",
          body: `${where} marked your visit as attended. Log it in your Screening Tracker.`,
          href: "/screening-tracker",
        });
      }
    }
    try {
      await setItem(SEEN_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  /** Keep reminders in step with the real slot; drop them when a booking ends. */
  const syncReminders = useCallback((rows: AppointmentDto[]) => {
    const n = notifsRef.current;
    for (const a of rows) {
      const [dayKey, soonKey] = reminderKeys(a.id);
      if (!n.hasReminder(dayKey) && !n.hasReminder(soonKey)) continue;
      if (!isLive(a)) {
        reminderKeys(a.id).forEach((k) => n.clearReminder(k));
        continue;
      }
      // Reschedule only when the slot moved.
      const [dayAt, soonAt] = reminderTimes(slotDate(a));
      const moved = n.reminderAt(dayKey) !== dayAt?.toISOString() || n.reminderAt(soonKey) !== soonAt?.toISOString();
      if (moved) void scheduleFor(a, n);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!config.hasBackend || !signedIn || busy.current) return;
    busy.current = true;
    setLoading(true);
    try {
      const rows = await fetchAppointments();
      await announce(rows);
      setAppointments(rows);
      syncReminders(rows);
    } catch {
      // Offline or signed out: keep showing what we had.
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }, [signedIn, announce, syncReminders]);

  useEffect(() => {
    if (authLoading) return; // still reading the saved sign-in: do not mistake that for signed out
    if (!signedIn) {
      setAppointments([]);
      void removeItem(SEEN_KEY).catch(() => undefined);
      return;
    }
    void refresh();
    const t = setInterval(() => void refresh(), POLL_MS);
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") void refresh();
    });
    return () => {
      clearInterval(t);
      sub.remove();
    };
  }, [signedIn, authLoading, refresh]);

  const cancel = useCallback(
    async (id: number) => {
      const updated = await cancelAppointment(id);
      reminderKeys(id).forEach((k) => notifsRef.current.clearReminder(k));
      setAppointments((rows) => rows.map((r) => (r.id === id ? updated : r)));
      void refresh();
    },
    [refresh],
  );

  const reschedule = useCallback(
    async (id: number, date: string, time: string) => {
      const updated = await rescheduleAppointment(id, date, time);
      setAppointments((rows) => rows.map((r) => (r.id === id ? updated : r)));
      void refresh();
    },
    [refresh],
  );

  const remind = useCallback(async (a: AppointmentDto) => {
    return scheduleFor(a, notifsRef.current);
  }, []);

  const value = useMemo<Ctx>(() => {
    const live = appointments.filter(isLive).sort((x, y) => slotDate(x).getTime() - slotDate(y).getTime());
    return {
      appointments,
      live,
      loading,
      refresh,
      cancel,
      reschedule,
      remind,
      hasReminder: (id) => reminderKeys(id).some((k) => notifs.hasReminder(k)),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointments, loading, refresh, cancel, reschedule, remind, notifs]);

  return <AppointmentsContext.Provider value={value}>{children}</AppointmentsContext.Provider>;
}

/** Schedules "tomorrow" (6pm the day before) and "soon" (2 hours before) reminders for a booking. */
export type BookingInfo = { id: number | string; when: Date; where: string; label: string };

function reminderTimes(when: Date): [Date | null, Date | null] {
  const dayBefore = atNine(new Date(when.getFullYear(), when.getMonth(), when.getDate() - 1));
  dayBefore.setHours(18, 0, 0, 0);
  const twoHours = new Date(when.getTime() - 2 * 60 * 60 * 1000);
  return [dayBefore.getTime() > Date.now() ? dayBefore : null, twoHours.getTime() > Date.now() ? twoHours : null];
}

const infoOf = (a: AppointmentDto): BookingInfo => ({ id: a.id, when: slotDate(a), where: a.centre?.name ?? "your screening centre", label: formatSlot(a) });

/** Schedules "tomorrow" (6pm the day before) and "soon" (2 hours before) reminders for a booking. */
export async function scheduleBookingReminders(info: BookingInfo, n: ReturnType<typeof useNotifications>): Promise<"phone" | "inbox"> {
  const [dayKey, soonKey] = reminderKeys(info.id);
  const [dayBefore, twoHours] = reminderTimes(info.when);

  let mode: "phone" | "inbox" = "inbox";
  if (dayBefore) {
    const r = await n.setReminder({
      key: dayKey,
      kind: "appointment",
      at: dayBefore,
      title: "Your screening is tomorrow",
      body: `${info.where}, ${info.label}.`,
      href: "/find",
    });
    if (r === "phone") mode = "phone";
  } else {
    n.clearReminder(dayKey);
  }
  if (twoHours) {
    const r = await n.setReminder({
      key: soonKey,
      kind: "appointment",
      at: twoHours,
      title: "Your screening is in 2 hours",
      body: `${info.where}, ${info.label}. Keep your phone on so the centre can reach you.`,
      href: "/find",
    });
    if (r === "phone") mode = "phone";
  } else {
    n.clearReminder(soonKey);
  }
  return mode;
}

const scheduleFor = (a: AppointmentDto, n: ReturnType<typeof useNotifications>) => scheduleBookingReminders(infoOf(a), n);

export function useAppointments(): Ctx {
  const ctx = useContext(AppointmentsContext);
  if (!ctx) throw new Error("useAppointments must be used inside AppointmentsProvider");
  return ctx;
}
