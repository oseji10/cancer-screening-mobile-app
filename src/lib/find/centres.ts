import type { ApiCentre } from "../api/centres";

export type Centre = {
  /** Server facility id as a string (sample data uses short names). */
  id: string;
  name: string;
  initial: string;
  lat: number;
  lng: number;
  services: string[];
  address: string;
  /** null = the centre has not listed its opening times. */
  open: boolean | null;
  phone: string | null;
  hours: string | null;
  /** SAMPLE data only: the real facilities table has no price or NHIS field yet. */
  nhis?: boolean;
  price?: number | null;
  /** Where the marker sits on the placeholder web map, as a share of the map area. */
  pos: { x: number; y: number };
  /** Marker colour. */
  tone: string;
};

// SAMPLE DATA from the Figma screens. Only used while EXPO_PUBLIC_API_URL is not set.
export const CENTRES: Centre[] = [
  { id: "jabi", name: "Jabi Diagnostic Centre", initial: "J", lat: 9.0689, lng: 7.4233, services: ["Mammogram", "Ultrasound"], address: "Jabi, Abuja", open: true, phone: null, hours: null, nhis: true, price: 25000, pos: { x: 0.47, y: 0.36 }, tone: "#DCD3F7" },
  { id: "utako", name: "Utako Imaging Clinic", initial: "U", lat: 9.0643, lng: 7.4399, services: ["Ultrasound"], address: "Utako, Abuja", open: true, phone: null, hours: null, nhis: false, price: 18000, pos: { x: 0.2, y: 0.28 }, tone: "#FBEBC0" },
  { id: "wuse", name: "Wuse Women's Clinic", initial: "W", lat: 9.0777, lng: 7.4663, services: ["Mammogram", "Clinical exam"], address: "Wuse 2, Abuja", open: false, phone: null, hours: null, nhis: true, price: 22000, pos: { x: 0.75, y: 0.2 }, tone: "#D3EFE8" },
  { id: "garki", name: "Garki Breast Care Centre", initial: "G", lat: 9.036, lng: 7.489, services: ["Mammogram"], address: "Garki, Abuja", open: true, phone: null, hours: null, nhis: false, price: 20000, pos: { x: 0.8, y: 0.62 }, tone: "#F9D6CF" },
];

// Centres from the last successful load, so the booking screen can look one up by id.
const known = new Map<string, Centre>();
export const rememberCentres = (list: Centre[]) => list.forEach((c) => known.set(c.id, c));
export const findCentre = (id?: string): Centre | undefined => (id ? known.get(id) ?? CENTRES.find((c) => c.id === id) : undefined);

const TONES = ["#DCD3F7", "#FBEBC0", "#D3EFE8", "#F9D6CF", "#D3DEFA", "#E6C7FF"];

/** Converts the server's centres to the app's shape and lays them out on the web-preview map. */
export function toCentres(list: ApiCentre[]): Centre[] {
  if (list.length === 0) return [];
  const lats = list.map((c) => c.lat);
  const lngs = list.map((c) => c.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const spread = (v: number, lo: number, hi: number) => (hi - lo < 1e-6 ? 0.5 : 0.12 + ((v - lo) / (hi - lo)) * 0.76);

  return list.map((c, i) => ({
    id: String(c.id),
    name: c.name,
    initial: (c.name.trim()[0] ?? "?").toUpperCase(),
    lat: c.lat,
    lng: c.lng,
    services: c.services,
    address: c.address,
    open: c.openNow,
    phone: c.phone,
    hours: c.hours,
    price: null,
    pos: { x: spread(c.lng, minLng, maxLng), y: 1 - spread(c.lat, minLat, maxLat) },
    tone: TONES[i % TONES.length],
  }));
}

export const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

/** Default map centre (Abuja) used until the person shares their location. */
export const DEFAULT_CENTRE = { latitude: 9.0579, longitude: 7.4951 };

export type Coords = { latitude: number; longitude: number };

/** Straight-line distance in km (haversine). */
export function distanceKm(a: Coords, b: Coords): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLng = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

export const formatKm = (km: number) => (km < 100 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`);
