import { apiFetch } from "./api/client";
import { config } from "./config";

/** Articles and announcements written on the admin dashboard (GET /bloom/posts, /bloom-chw/posts). */
export type Post = {
  id: number;
  kind: "article" | "announcement";
  title: string;
  summary: string | null;
  body: string | null;
  coverUrl: string | null;
  linkUrl: string | null;
  pinned: boolean;
  publishedAt: string | null;
};

type Req = <T>(path: string, method?: "GET" | "POST" | "PATCH" | "DELETE", body?: unknown) => Promise<T>;

// Shown when the app is not connected to the server (preview / sample mode).
const now = new Date().toISOString();
const SAMPLE: Post[] = [
  {
    id: 1,
    kind: "announcement",
    title: "Free breast screening week",
    summary: "Screening centres across the country offer free clinical breast exams next week. Book a slot in the app.",
    body: "Screening centres across the country offer free clinical breast exams next week.\n\nBook a slot from the Find tab and bring a valid ID.",
    coverUrl: null,
    linkUrl: null,
    pinned: true,
    publishedAt: now,
  },
  {
    id: 2,
    kind: "article",
    title: "Five signs to check for during your self-exam",
    summary: "What changes to look and feel for each month, and when to see a health worker.",
    body: "## Look\nStand in front of a mirror with your arms by your side, then raised.\n\n## Feel\n- A new lump or thickening\n- Skin that dimples or puckers\n- Changes to the nipple\n- Discharge that is not breast milk\n- Pain in one spot that does not go away\n\nIf you notice any of these, book a check with a health worker.",
    coverUrl: null,
    linkUrl: null,
    pinned: false,
    publishedAt: now,
  },
];

export async function getPosts(side: "women" | "chw", request?: Req, limit = 20): Promise<Post[]> {
  if (!config.hasBackend) return SAMPLE;
  if (side === "chw" && request) return (await request<{ data: Post[] }>(`/bloom-chw/posts?limit=${limit}`)).data;
  return (await apiFetch<{ data: Post[] }>(`/bloom/posts?limit=${limit}`, { auth: false })).data;
}

export async function getPost(side: "women" | "chw", id: number, request?: Req): Promise<Post> {
  if (!config.hasBackend) {
    const p = SAMPLE.find((x) => x.id === id);
    if (!p) throw new Error("This article is no longer available.");
    return p;
  }
  if (side === "chw" && request) return (await request<{ data: Post }>(`/bloom-chw/posts/${id}`)).data;
  return (await apiFetch<{ data: Post }>(`/bloom/posts/${id}`, { auth: false })).data;
}

export function postDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
