import { getItem, setItem } from "../storage/localStore";

const KEY = "bloom_quiz_v1";

/** Total Myth Busters points, kept on this device only. */
export async function loadPoints(): Promise<number> {
  try {
    const raw = await getItem(KEY);
    const n = raw ? Number(JSON.parse(raw).points) : 0;
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

export async function addPoints(earned: number): Promise<number> {
  const total = (await loadPoints()) + earned;
  await setItem(KEY, JSON.stringify({ points: total }));
  return total;
}
