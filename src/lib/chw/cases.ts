import { chw } from "./theme";

export type StepStatus = "not-started" | "in-progress" | "completed" | "not-needed";
export type Outcome = "pending" | "no-change" | "concerning-change";

/** One woman the health worker is supporting. Identified by case code only (no name) to protect privacy. */
export type ChwCase = {
  id: string;
  screening: string;
  facility: string;
  community: string;
  /** YYYY-MM-DD the request came in. */
  initiated: string;
  contact: string;
  outcome: Outcome;
  notes: string;
  referralFacility: string;
  referralDate: string;
  followUpDate: string;
  /** Community follow-up, PHC screening, Referral, Follow-up. */
  steps: [StepStatus, StepStatus, StepStatus, StepStatus];
  /** Live mode only: the server id, the woman's name/age, and the booking. */
  serverId?: number;
  ncsrClientId?: string | null;
  clientName?: string;
  clientAge?: number | null;
  appointmentStatus?: string;
  appointmentSlot?: string;
  /** Closed by the server: finished, or the woman cancelled before any follow-up. */
  closed?: boolean;
};

export const STEP_TITLES = ["Community follow-up", "PHC screening", "Referral", "Follow-up"] as const;
export const STEP_ROUTES = ["community", "phc", "referral", "followup"] as const;

export type Stage = "new" | "community" | "screening" | "referral" | "completed" | "withdrawn";

/** The step being worked on: the first one that is neither done nor skipped. */
export function currentStep(c: ChwCase): number | null {
  const i = c.steps.findIndex((s) => s === "in-progress" || s === "not-started");
  return i === -1 ? null : i;
}

export function stageOf(c: ChwCase): Stage {
  if (c.closed && c.steps[0] === "not-started") return "withdrawn";
  if (c.closed) return "completed";
  if (c.steps.every((s) => s === "not-started")) return "new";
  const i = currentStep(c);
  if (i === null) return "completed";
  if (i === 0) return "community";
  if (i === 1) return "screening";
  return "referral";
}

export const STAGE_LABEL: Record<Stage, string> = {
  new: "New case",
  community: "Community follow-up",
  screening: "PHC screening",
  referral: "Referral follow-up",
  completed: "Case closed",
  withdrawn: "Cancelled by the woman",
};

export const STAGE_STATUS: Record<Stage, { text: string; color: string }> = {
  new: { text: "New", color: chw.teal },
  community: { text: "In progress", color: chw.purple },
  screening: { text: "Screening", color: "#3D7BD9" },
  referral: { text: "Follow-up", color: chw.amber },
  completed: { text: "Completed", color: "#6B7280" },
  withdrawn: { text: "Cancelled", color: "#9CA3AF" },
};

/** A step can be opened once every step before it is done (or not needed). */
export function canOpen(c: ChwCase, index: number): boolean {
  if (c.steps[index] === "not-needed") return false;
  if (c.closed && c.steps[0] === "not-started") return false;
  return c.steps.slice(0, index).every((s) => s === "completed" || s === "not-needed");
}

export function stepStatusText(s: StepStatus): string {
  if (s === "completed") return "Completed";
  if (s === "in-progress") return "In progress";
  if (s === "not-needed") return "Not needed";
  return "Not started";
}

export function formatDay(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** SAMPLE cases so the screens can be tried before the NCSR backend for health workers exists. */
export function sampleCases(): ChwCase[] {
  const base = { outcome: "pending" as Outcome, notes: "", referralFacility: "", referralDate: "", followUpDate: "" };
  return [
    { ...base, id: "BLM-001", screening: "Breast screening", facility: "Mubi General Hospital", community: "Mubi North", initiated: daysAgo(0), contact: "0803 123 4567", steps: ["not-started", "not-started", "not-started", "not-started"] },
    { ...base, id: "BLM-002", screening: "Mammogram", facility: "Mubi General Hospital", community: "Mubi South", initiated: daysAgo(1), contact: "0806 555 3211", steps: ["not-started", "not-started", "not-started", "not-started"] },
    { ...base, id: "BLM-003", screening: "Breast screening", facility: "PHC Lokuwa", community: "Lokuwa", initiated: daysAgo(2), contact: "0810 222 7788", notes: "Prefers a morning visit.", steps: ["in-progress", "not-started", "not-started", "not-started"] },
    { ...base, id: "BLM-004", screening: "Clinical breast exam", facility: "PHC Girei", community: "Girei", initiated: daysAgo(4), contact: "", steps: ["completed", "in-progress", "not-started", "not-started"] },
    { ...base, id: "BLM-005", screening: "Mammogram", facility: "Mubi General Hospital", community: "Girei", initiated: daysAgo(6), contact: "0902 444 1200", outcome: "concerning-change", notes: "Change identified during PHC assessment.", referralFacility: "Federal Medical Centre Yola", referralDate: daysAgo(-3), steps: ["completed", "completed", "completed", "in-progress"] },
    { ...base, id: "BLM-006", screening: "Breast screening", facility: "PHC Vimtim", community: "Vimtim", initiated: daysAgo(9), contact: "0703 919 0045", outcome: "no-change", notes: "Routine screening advised.", steps: ["completed", "completed", "not-needed", "not-needed"] },
  ];
}
