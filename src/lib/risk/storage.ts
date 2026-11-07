import { getItem, removeItem, setItem } from "../storage/localStore";
import type { Answers } from "./types";

const KEY = "bloom_risk_v1";

export type SavedAssessment = { answers: Answers; completedAt: string };

/** Keeps the last finished assessment on this device only (nothing is sent anywhere). */
export async function saveAssessment(answers: Answers): Promise<void> {
  const value: SavedAssessment = { answers, completedAt: new Date().toISOString() };
  await setItem(KEY, JSON.stringify(value));
}

export async function loadAssessment(): Promise<SavedAssessment | null> {
  try {
    const raw = await getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedAssessment;
    return parsed?.answers ? parsed : null;
  } catch {
    return null;
  }
}

export const clearAssessment = () => removeItem(KEY);
