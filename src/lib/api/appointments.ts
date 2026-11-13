import { config } from "../config";
import { apiFetch } from "./client";

export type AppointmentStatus = "pending" | "confirmed" | "declined" | "cancelled" | "completed";

export type AppointmentDto = {
  id: number;
  status: AppointmentStatus;
  type: string;
  /** What the person asked for (YYYY-MM-DD / HH:MM). */
  date: string;
  time: string | null;
  note: string | null;
  /** The slot the centre agreed to, once confirmed. */
  confirmedDate: string | null;
  confirmedTime: string | null;
  /** Message from the centre (why it was declined, or what to bring). */
  staffNote: string | null;
  decidedAt: string | null;
  centre: { id: number; name: string; address: string | null; phone: string | null } | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type NewAppointment = {
  facilityId: number;
  /** YYYY-MM-DD */
  date: string;
  /** HH:MM, 24-hour */
  time: string;
  type?: "general" | "mammogram" | "cbe" | "ultrasound" | "biopsy" | "mri";
  note?: string;
};

const base = () => `${config.bloomPath}/appointments`;

export async function createAppointment(input: NewAppointment): Promise<AppointmentDto> {
  const res = await apiFetch<{ data: AppointmentDto }>(base(), {
    method: "POST",
    body: {
      facility_id: input.facilityId,
      preferred_date: input.date,
      preferred_time: input.time,
      type: input.type ?? "general",
      note: input.note,
    },
  });
  return res.data;
}

export async function fetchAppointments(): Promise<AppointmentDto[]> {
  const res = await apiFetch<{ data: AppointmentDto[] }>(base());
  return res.data;
}

export async function cancelAppointment(id: number): Promise<AppointmentDto> {
  const res = await apiFetch<{ data: AppointmentDto }>(`${base()}/${id}/cancel`, { method: "POST" });
  return res.data;
}

/** Changes the day/time. A confirmed booking goes back to "pending" until the centre confirms the new slot. */
export async function rescheduleAppointment(id: number, date: string, time: string): Promise<AppointmentDto> {
  const res = await apiFetch<{ data: AppointmentDto }>(`${base()}/${id}`, {
    method: "PATCH",
    body: { preferred_date: date, preferred_time: time },
  });
  return res.data;
}
