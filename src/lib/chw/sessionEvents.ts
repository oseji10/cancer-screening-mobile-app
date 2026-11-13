/** Lets code outside the health-worker screens (the app lock) tell ChwProvider the session changed. */
type Kind = "signed-out" | "refreshed";
const listeners = new Set<(k: Kind) => void>();

export function onChwSession(cb: (k: Kind) => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function emitChwSession(k: Kind): void {
  listeners.forEach((cb) => cb(k));
}
