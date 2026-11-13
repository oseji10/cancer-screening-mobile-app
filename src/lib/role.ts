import { getItem, removeItem, setItem } from "./storage/localStore";

/** Which side of Bloom this phone opens on: "woman" or "chw" (community health worker). */
export const ROLE_KEY = "bloom_role_v1";
export type Role = "woman" | "chw";

export async function getRole(): Promise<Role | null> {
  try {
    const v = await getItem(ROLE_KEY);
    return v === "woman" || v === "chw" ? v : null;
  } catch {
    return null;
  }
}

export async function setRole(role: Role): Promise<void> {
  await setItem(ROLE_KEY, role).catch(() => undefined);
}

export async function clearRole(): Promise<void> {
  await removeItem(ROLE_KEY).catch(() => undefined);
}
