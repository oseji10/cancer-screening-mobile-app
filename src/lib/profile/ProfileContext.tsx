import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { getItem, removeItem, setItem } from "../storage/localStore";

const KEY = "bloom_profile_v1";

export type HelpTopic = "breast-health" | "screening" | "appointment" | "community";

export type Profile = {
  age: number | null;
  need: HelpTopic | null;
  name: string;
};

type Stored = Profile & { onboarded: boolean };

const EMPTY: Stored = { age: null, need: null, name: "", onboarded: false };

type ProfileContextValue = {
  /** False until the stored profile has been read; the splash waits for it. */
  loaded: boolean;
  onboarded: boolean;
  profile: Profile;
  update: (patch: Partial<Profile>) => void;
  /** Saves the profile and marks onboarding as finished. */
  finishOnboarding: (patch?: Partial<Profile>) => Promise<void>;
  /** Clears the saved profile so onboarding runs again (used by the dev reset and, later, sign-out). */
  reset: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Stored>(EMPTY);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await getItem(KEY);
        if (raw && alive) setState({ ...EMPTY, ...(JSON.parse(raw) as Partial<Stored>) });
      } catch {
        // Unreadable or missing: start fresh.
      } finally {
        if (alive) setLoaded(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const update = useCallback((patch: Partial<Profile>) => {
    setState((current) => ({ ...current, ...patch }));
  }, []);

  const finishOnboarding = useCallback(
    async (patch: Partial<Profile> = {}) => {
      const next: Stored = { ...state, ...patch, onboarded: true };
      setState(next);
      try {
        await setItem(KEY, JSON.stringify(next));
      } catch {
        // Not fatal: the user simply sees onboarding again next launch.
      }
    },
    [state],
  );

  const reset = useCallback(async () => {
    setState(EMPTY);
    try {
      await removeItem(KEY);
    } catch {
      // Nothing to clear.
    }
  }, []);

  const value = useMemo<ProfileContextValue>(
    () => ({
      loaded,
      onboarded: state.onboarded,
      profile: { age: state.age, need: state.need, name: state.name },
      update,
      finishOnboarding,
      reset,
    }),
    [loaded, state, update, finishOnboarding, reset],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used inside ProfileProvider");
  return ctx;
}
