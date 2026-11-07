import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { getItem, setItem } from "../storage/localStore";

const KEY = "bloom_track_v1";

export type MammogramEntry = { id: string; date: string }; // date = ISO string

export type ChangeReport = {
  id: string;
  date: string; // ISO
  feeling: string | null;
  described: string[];
  where: string[];
  firstNoticed: string | null;
  trend: string | null;
  otherSymptoms: string[];
  note: string;
};

export type AppointmentRequest = {
  id: string;
  centreId: string;
  centreName: string;
  /** Human-readable slot, e.g. "Today, 7:00 PM". */
  slot: string;
  requestedAt: string; // ISO
};

type Stored = { sbe: string[]; mammograms: MammogramEntry[]; changes: ChangeReport[]; appointments: AppointmentRequest[] };
const EMPTY: Stored = { sbe: [], mammograms: [], changes: [], appointments: [] };

type TrackContextValue = {
  /** ISO dates of every logged self breast exam. */
  sbe: string[];
  mammograms: MammogramEntry[];
  /** How many self breast exams were logged in the given year. */
  sbeCountForYear: (year: number) => number;
  /** Months (0-11) of the given year that have at least one logged exam. */
  sbeMonthsForYear: (year: number) => boolean[];
  doneSbeThisMonth: boolean;
  logSbe: () => void;
  logMammogram: () => void;
  removeMammogram: (id: string) => void;
  /** Remembers that the user asked to be reminded next month (no notifications yet). */
  remindNextMonth: () => void;
  /** Breast changes the user has reported through "I noticed a change". Stored on this device only. */
  changes: ChangeReport[];
  logChange: (report: Omit<ChangeReport, "id" | "date">) => void;
  /** Appointment requests sent to screening centres (newest first). Stored on this device only for now. */
  appointments: AppointmentRequest[];
  requestAppointment: (req: Omit<AppointmentRequest, "id" | "requestedAt">) => void;
};

const TrackContext = createContext<TrackContextValue | null>(null);

export function TrackProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Stored>(EMPTY);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await getItem(KEY);
        if (raw && alive) setState({ ...EMPTY, ...(JSON.parse(raw) as Partial<Stored>) });
      } catch {
        // Missing or unreadable: start empty.
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const save = useCallback((next: Stored) => {
    setState(next);
    void setItem(KEY, JSON.stringify(next)).catch(() => undefined);
  }, []);

  const value = useMemo<TrackContextValue>(() => {
    const now = new Date();
    const sameMonth = (iso: string) => {
      const d = new Date(iso);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    };
    return {
      sbe: state.sbe,
      mammograms: state.mammograms,
      sbeCountForYear: (year) => state.sbe.filter((iso) => new Date(iso).getFullYear() === year).length,
      sbeMonthsForYear: (year) => {
        const months = Array<boolean>(12).fill(false);
        for (const iso of state.sbe) {
          const d = new Date(iso);
          if (d.getFullYear() === year) months[d.getMonth()] = true;
        }
        return months;
      },
      doneSbeThisMonth: state.sbe.some(sameMonth),
      logSbe: () => save({ ...state, sbe: [...state.sbe, new Date().toISOString()] }),
      logMammogram: () =>
        save({ ...state, mammograms: [{ id: String(Date.now()), date: new Date().toISOString() }, ...state.mammograms] }),
      removeMammogram: (id) => save({ ...state, mammograms: state.mammograms.filter((m) => m.id !== id) }),
      remindNextMonth: () => undefined,
      appointments: state.appointments,
      requestAppointment: (req) =>
        save({ ...state, appointments: [{ ...req, id: String(Date.now()), requestedAt: new Date().toISOString() }, ...state.appointments] }),
      changes: state.changes,
      logChange: (report) =>
        save({ ...state, changes: [{ ...report, id: String(Date.now()), date: new Date().toISOString() }, ...state.changes] }),
    };
  }, [state, save]);

  return <TrackContext.Provider value={value}>{children}</TrackContext.Provider>;
}

export function useTrack(): TrackContextValue {
  const ctx = useContext(TrackContext);
  if (!ctx) throw new Error("useTrack must be used inside TrackProvider");
  return ctx;
}
