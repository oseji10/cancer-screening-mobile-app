/** Facility directory for health workers (GET /bloom-chw/facility-directory). Sample mode uses made-up facilities. */
export type DirectoryFacility = {
  id: number;
  name: string;
  isMine: boolean;
  address: string | null;
  lga: string | null;
  state: string | null;
  level: string | null;
  kinds: string[];
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  hours: string | null;
  lat: number | null;
  lng: number | null;
  contactPerson: { name: string | null; phone: string | null; email: string | null } | null;
};

export type DirectoryQuery = { search?: string; area?: "state" | "all"; type?: "screening" | "treatment" };

type Req = <T>(path: string, method?: "GET" | "POST" | "PATCH" | "DELETE", body?: unknown) => Promise<T>;

const SAMPLE: DirectoryFacility[] = [
  { id: 12, name: "Jabi Diagnostic Centre", isMine: true, address: "Plot 12 Obafemi Awolowo Way, Jabi, AMAC, FCT", lga: "AMAC", state: "FCT", level: "hub", kinds: ["Screening"], phone: "08030000001", whatsapp: "08030000001", email: "info@jabidiagnostic.example", hours: "Mon, Tue, Wed, Thu, Fri · 08:00 - 16:00", lat: 9.07, lng: 7.42, contactPerson: { name: "Ngozi Eze", phone: "08030000011", email: null } },
  { id: 15, name: "Wuse Women's Clinic", isMine: false, address: "Wuse Zone 3, AMAC, FCT", lga: "AMAC", state: "FCT", level: "feeder", kinds: ["Screening"], phone: "08030000002", whatsapp: null, email: null, hours: "Mon, Wed, Fri · 09:00 - 15:00", lat: 9.08, lng: 7.47, contactPerson: null },
  { id: 20, name: "National Hospital Abuja", isMine: false, address: "Central Business District, AMAC, FCT", lga: "AMAC", state: "FCT", level: "hub", kinds: ["Screening", "Treatment"], phone: "08030000003", whatsapp: null, email: "oncology@nha.example", hours: null, lat: 9.04, lng: 7.48, contactPerson: { name: "Dr. Musa Garba", phone: "08030000033", email: "m.garba@nha.example" } },
  { id: 31, name: "Kubwa General Hospital", isMine: false, address: "Kubwa, Bwari, FCT", lga: "Bwari", state: "FCT", level: "subhub", kinds: ["Screening"], phone: null, whatsapp: null, email: null, hours: null, lat: null, lng: null, contactPerson: null },
];

export async function getFacilityDirectory(live: boolean, request: Req, q: DirectoryQuery = {}): Promise<DirectoryFacility[]> {
  if (!live) {
    const t = (q.search ?? "").trim().toLowerCase();
    return SAMPLE.filter(
      (f) =>
        (!t || [f.name, f.lga, f.state, f.address].some((x) => (x ?? "").toLowerCase().includes(t))) &&
        (!q.type || f.kinds.includes(q.type === "screening" ? "Screening" : "Treatment")),
    );
  }
  const params = new URLSearchParams();
  if (q.search?.trim()) params.set("search", q.search.trim());
  if (q.area) params.set("area", q.area);
  if (q.type) params.set("type", q.type);
  const qs = params.toString();
  const res = await request<{ data: DirectoryFacility[] }>(`/bloom-chw/facility-directory${qs ? `?${qs}` : ""}`);
  return res.data;
}

/** 0803… → 234803… for wa.me links. */
export function waNumber(p: string): string {
  const d = p.replace(/\D+/g, "");
  if (d.startsWith("0") && d.length === 11) return `234${d.slice(1)}`;
  return d;
}
