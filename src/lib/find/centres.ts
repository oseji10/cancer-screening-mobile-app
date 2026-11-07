export type Centre = {
  id: string;
  name: string;
  initial: string;
  lat: number;
  lng: number;
  services: string[];
  address: string;
  open: boolean;
  nhis: boolean;
  /** Price in naira. */
  price: number;
  /** Where the marker sits on the placeholder map, as a share of the map area. */
  pos: { x: number; y: number };
  /** Marker colour [fill, ring tint]. */
  tone: string;
};

// SAMPLE DATA from the Figma screens. Replace with the real list from the NCSR facilities API.
export const CENTRES: Centre[] = [
  { id: "jabi", name: "Jabi Diagnostic Centre", initial: "J", lat: 9.0689, lng: 7.4233, services: ["Mammogram", "Ultrasound"], address: "Jabi, Abuja", open: true, nhis: true, price: 25000, pos: { x: 0.47, y: 0.36 }, tone: "#DCD3F7" },
  { id: "utako", name: "Utako Imaging Clinic", initial: "U", lat: 9.0643, lng: 7.4399, services: ["Ultrasound"], address: "Utako, Abuja", open: true, nhis: false, price: 18000, pos: { x: 0.2, y: 0.28 }, tone: "#FBEBC0" },
  { id: "wuse", name: "Wuse Women's Clinic", initial: "W", lat: 9.0777, lng: 7.4663, services: ["Mammogram", "Clinical exam"], address: "Wuse 2, Abuja", open: false, nhis: true, price: 22000, pos: { x: 0.75, y: 0.2 }, tone: "#D3EFE8" },
  { id: "garki", name: "Garki Breast Care Centre", initial: "G", lat: 9.036, lng: 7.489, services: ["Mammogram"], address: "Garki, Abuja", open: true, nhis: false, price: 20000, pos: { x: 0.8, y: 0.62 }, tone: "#F9D6CF" },
];

export const findCentre = (id?: string) => CENTRES.find((c) => c.id === id);
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
