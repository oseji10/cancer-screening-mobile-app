/**
 * Health worker: notification bell, client search at her facility, and access requests.
 * Live mode calls /bloom-chw/...; sample mode uses a few made-up clients kept in memory.
 */
export type StaffNotification = { id: number; type: string; title: string; body: string | null; caseId: number | null; read: boolean; createdAt: string | null };

export type Access = "mine" | "pending" | "other" | "none";
export type ClientHit = { clientId: string; name: string; age: number | null; lga: string | null; phone: string | null; access: Access; caseId: number | null };

export type AccessRequest = {
  id: number;
  clientId: string;
  clientName: string | null;
  reason: string;
  status: "pending" | "approved" | "rejected";
  decisionNote: string | null;
  caseId: number | null;
  createdAt: string | null;
  decidedAt: string | null;
};

type Req = <T>(path: string, method?: "GET" | "POST" | "PATCH" | "DELETE", body?: unknown) => Promise<T>;

// ---- sample mode -------------------------------------------------------------------------------
const now = () => new Date().toISOString();
const SAMPLE_CLIENTS: ClientHit[] = [
  { clientId: "JDC-FCT-AMC-000231", name: "Halima Yusuf", age: 47, lga: "AMAC", phone: "0803•••412", access: "none", caseId: null },
  { clientId: "JDC-FCT-AMC-000198", name: "Grace Okon", age: 52, lga: "Bwari", phone: "0706•••118", access: "other", caseId: null },
  { clientId: "JDC-FCT-AMC-000305", name: "Hauwa Ibrahim", age: 39, lga: "AMAC", phone: "0812•••903", access: "none", caseId: null },
];
let sampleRequests: AccessRequest[] = [];
let sampleNotes: StaffNotification[] = [
  { id: 2, type: "case_assigned", title: "New case assigned: BLM-00011", body: "A woman booked screening at your facility. Open the case to start the community follow-up.", caseId: null, read: false, createdAt: now() },
  { id: 1, type: "booking", title: "Booking confirmed: BLM-00007", body: "The centre confirmed her visit.", caseId: null, read: true, createdAt: now() },
];

// ---- calls ---------------------------------------------------------------------------------------
export async function getNotifications(live: boolean, request: Req): Promise<{ unread: number; items: StaffNotification[] }> {
  if (!live) return { unread: sampleNotes.filter((n) => !n.read).length, items: sampleNotes };
  const res = await request<{ data: { unread: number; items: StaffNotification[] } }>("/bloom-chw/notifications");
  return res.data;
}

export async function markNotificationsRead(live: boolean, request: Req, ids?: number[]): Promise<void> {
  if (!live) {
    sampleNotes = sampleNotes.map((n) => (!ids || ids.includes(n.id) ? { ...n, read: true } : n));
    return;
  }
  await request("/bloom-chw/notifications/read", "POST", ids ? { ids } : {});
}

export async function searchClients(live: boolean, request: Req, q: string): Promise<ClientHit[]> {
  const term = q.trim();
  if (term.length < 2) return [];
  if (!live) {
    const t = term.toLowerCase();
    return SAMPLE_CLIENTS.filter((c) => c.name.toLowerCase().includes(t) || c.clientId.toLowerCase().includes(t)).map((c) =>
      c.access === "none" && sampleRequests.some((r) => r.clientId === c.clientId && r.status === "pending") ? { ...c, access: "pending" } : c,
    );
  }
  const res = await request<{ data: ClientHit[] }>(`/bloom-chw/clients/search?q=${encodeURIComponent(term)}`);
  return res.data;
}

export async function getMyRequests(live: boolean, request: Req): Promise<AccessRequest[]> {
  if (!live) return sampleRequests;
  const res = await request<{ data: AccessRequest[] }>("/bloom-chw/access-requests");
  return res.data;
}

export async function requestAccess(live: boolean, request: Req, client: ClientHit, reason: string): Promise<AccessRequest> {
  if (!live) {
    const row: AccessRequest = { id: Date.now(), clientId: client.clientId, clientName: client.name, reason, status: "pending", decisionNote: null, caseId: null, createdAt: now(), decidedAt: null };
    sampleRequests = [row, ...sampleRequests];
    return row;
  }
  const res = await request<{ data: AccessRequest }>("/bloom-chw/access-requests", "POST", { clientId: client.clientId, reason });
  return res.data;
}

/** "5 min ago", "Yesterday", "12 Nov" */
export function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const s = Math.max(0, (Date.now() - t) / 1000);
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 172800) return "Yesterday";
  return new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
