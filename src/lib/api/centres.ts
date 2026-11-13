import { config } from "../config";
import { apiFetch } from "./client";

export type ApiCentre = {
  id: number;
  name: string;
  address: string;
  state: string | null;
  lga: string | null;
  lat: number;
  lng: number;
  distanceKm: number | null;
  phone: string | null;
  whatsapp: string | null;
  hours: string | null;
  /** null = the centre has not recorded its opening times. */
  openNow: boolean | null;
  isScreening: boolean;
  isTreatment: boolean;
  services: string[];
};

export type CentresQuery = { lat?: number; lng?: number; radiusKm?: number; limit?: number; openNow?: boolean };

export async function fetchCentres(query: CentresQuery, signal?: AbortSignal): Promise<ApiCentre[]> {
  const params: string[] = [];
  if (query.lat !== undefined && query.lng !== undefined) {
    params.push(`lat=${query.lat.toFixed(5)}`, `lng=${query.lng.toFixed(5)}`);
  }
  if (query.radiusKm !== undefined) params.push(`radius_km=${query.radiusKm}`);
  if (query.limit !== undefined) params.push(`limit=${query.limit}`);
  if (query.openNow) params.push("open_now=1");

  const qs = params.length ? `?${params.join("&")}` : "";
  const res = await apiFetch<{ data: ApiCentre[] }>(`${config.bloomPath}/centres${qs}`, { auth: false, signal });
  return res.data;
}
