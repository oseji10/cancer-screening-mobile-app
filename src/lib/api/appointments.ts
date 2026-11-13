import { config } from "../config";
import { apiFetch } from "./client";

export type AppointmentDto = {
  id: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  type: string;
  date: string; // YYYY-MM-DD
  time: string | null; // HH:MM
  note: string | null;
  centre: { id: number; name: string; address: string | null; phone: string | null } | null;
  createdAt: string | null;
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

export async function createAppointment(input: NewAppointment): Promise<AppointmentDto> {
  const res = await apiFetch<{ data: AppointmentDto }>(`${config.bloomPath}/appointments`, {
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
