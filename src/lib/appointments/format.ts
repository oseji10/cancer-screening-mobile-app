import type { AppointmentDto } from "../api/appointments";

/** The slot that counts: the centre's confirmed one, otherwise what the person asked for. */
export function slotOf(a: AppointmentDto): { date: string; time: string | null } {
  return a.confirmedDate ? { date: a.confirmedDate, time: a.confirmedTime } : { date: a.date, time: a.time };
}

/** Local Date for an appointment's slot (no time = 9am). */
export function slotDate(a: AppointmentDto): Date {
  const { date, time } = slotOf(a);
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = (time ?? "09:00").split(":").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, hh ?? 9, mm ?? 0, 0, 0);
}

export function formatSlot(a: AppointmentDto): string {
  const d = slotDate(a);
  const day = d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
  const { time } = slotOf(a);
  return time ? `${day}, ${d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}` : day;
}

export const STATUS_LABEL: Record<AppointmentDto["status"], string> = {
  pending: "Waiting for the centre",
  confirmed: "Confirmed",
  declined: "Not accepted",
  cancelled: "Cancelled",
  completed: "Attended",
};

/** Bookings that are still live (the ones the Find tab shows). */
export const isLive = (a: AppointmentDto) => a.status === "pending" || a.status === "confirmed";
