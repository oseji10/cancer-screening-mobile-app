/**
 * Breast screening tests, as defined by the NCSR test catalogue (served by GET /bloom-chw/screening-tests),
 * and the same helpers the web app uses in lib/screeningTests.ts.
 */
export type Severity = "normal" | "abnormal" | "urgent" | "neutral";
export type ResultOption = { value: string; label: string; severity: Severity };
export type ExtraOption = string | { value: string; label: string };
export type ExtraField = {
  name: string;
  label: string;
  type: "select" | "text" | "number";
  options?: ExtraOption[];
  showWhen?: { field: string; in: string[] };
  required?: boolean;
  min?: number;
  max?: number;
  inconclusiveWhen?: string[];
};
export type ScreeningTest = {
  key: string;
  cancerType: string;
  label: string;
  refPrefix: string;
  kind: "specimen" | "procedure";
  sex: "female" | "male" | "any";
  specimenTypes?: string[];
  collectionMethods?: { value: string; label: string }[];
  results: ResultOption[];
  value?: { label: string; unit: string; min: number; max: number; bands: { below?: number; result: string }[] };
  extraFields?: ExtraField[];
  detail?: { name: string; label: string; requiredFor: string[]; options: { value: string; label: string }[] };
};

export type Sample = {
  sampleId: number;
  sampleRef: string | null;
  testType: string;
  status: "booked" | "collected" | "result_released";
  sampleDate: string | null;
  specimenType: string | null;
  collectionMethod: string | null;
  labSampleNumber: string | null;
  collectedBy: string | null;
  notes: string | null;
  result: string | null;
  resultSeverity: Severity | null;
  resultValue: number | null;
  resultDetail: string | null;
  resultMeta: Record<string, string> | null;
  resultDate: string | null;
  resultNotes: string | null;
  fromBloom: boolean;
  /** A deletion request is waiting for an admin. */
  deletionPending?: boolean;
};

export type NcsrClient = { clientId: string; fullName: string; age: number | null; phoneNumber: string | null; stateOfResidence: string | null; lgaOfResidence: string | null };

export type ScreeningData = {
  client: NcsrClient | null;
  defaults: { stateOfResidence: string | null; lgaOfResidence: string | null; age: number | null };
  samples: Sample[];
};

export const extraOptions = (f: ExtraField) => (f.options ?? []).map((o) => (typeof o === "string" ? { value: o, label: o } : o));
export const extraVisible = (f: ExtraField, meta?: Record<string, unknown> | null) =>
  !f.showWhen || f.showWhen.in.includes(String(meta?.[f.showWhen.field] ?? ""));
export const resultLabel = (t: ScreeningTest | undefined, result?: string | null) => t?.results.find((r) => r.value === result)?.label ?? result ?? "";
export const collectDateLabel = (t: ScreeningTest) => (t.kind === "procedure" ? "Date test performed" : "Date sample taken");
export const collectNoun = (t: ScreeningTest) => (t.kind === "procedure" ? "test" : "sample");
export const inconclusiveRun = (t: ScreeningTest, meta?: Record<string, unknown> | null) =>
  !!t.extraFields?.some((f) => f.inconclusiveWhen && meta && f.inconclusiveWhen.includes(String(meta[f.name] ?? "")));

export function deriveResult(t: ScreeningTest, value: number): string | null {
  if (!t.value || Number.isNaN(value)) return null;
  for (const b of t.value.bands) if (b.below === undefined || value < b.below) return b.result;
  return null;
}

export const FINDING: Record<string, { label: string; color: string; bg: string }> = {
  normal: { label: "Non-suspicious", color: "#166534", bg: "#DCFCE7" },
  abnormal: { label: "Suspicious", color: "#B91C1C", bg: "#FEE2E2" },
  urgent: { label: "Suspicious", color: "#B91C1C", bg: "#FEE2E2" },
  neutral: { label: "Inconclusive", color: "#374151", bg: "#F3F4F6" },
};

/** Plain-language next step after a result (same wording as the web app, minus cervical-only cases). */
export function nextStep(t: ScreeningTest, result: string | null, meta?: Record<string, unknown> | null): { tone: "ok" | "warn" | "info"; text: string } {
  const severity = t.results.find((r) => r.value === result)?.severity ?? "neutral";
  if (inconclusiveRun(t, meta)) return { tone: "info", text: "The run was not valid, so no result can be given. Repeat the test." };
  if (severity === "urgent")
    return { tone: "warn", text: "Suspicious result. Tell her promptly and arrange the next test or a referral. Continue to the referral step in this case." };
  if (severity === "abnormal") return { tone: "warn", text: "Abnormal result. Plan the next test, follow-up or referral." };
  if (severity === "neutral") return { tone: "info", text: "The result is not conclusive. A repeat sample or test is usually needed." };
  return { tone: "ok", text: "Normal result. Encourage her to keep up monthly self-checks and routine re-screening." };
}
