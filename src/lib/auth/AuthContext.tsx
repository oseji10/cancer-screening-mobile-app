import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { Account, fetchMe, logoutRequest, SignedIn } from "../api/auth";
import { setUnauthorizedHandler } from "../api/client";
import { config } from "../config";
import { type HelpTopic, useProfile } from "../profile/ProfileContext";
import { getItem, removeItem, setItem } from "../storage/localStore";
import { clearToken, getToken, saveToken } from "./tokenStorage";

const ACCOUNT_KEY = "bloom_account_v1";

type AuthState = {
  token: string | null;
  /** The signed-in person, or null for a guest. Everything except booking works as a guest. */
  account: Account | null;
  signedIn: boolean;
  /** True until the stored session (if any) has been read on app start. */
  loading: boolean;
  /** Call with the server's answer to verify / login / reset. Saves the session and copies the profile. */
  completeSignIn: (result: SignedIn) => Promise<void>;
  /** Replace the cached account after the person edits their details. */
  setAccount: (account: Account) => void;
  /** Signs out on the server (best effort) and clears this device's session. */
  logout: () => Promise<void>;
  /** Clears this device's session without calling the server (account deleted, or token rejected). */
  clearSession: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { finishOnboarding } = useProfile();
  const [token, setToken] = useState<string | null>(null);
  const [account, setAccountState] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  const cacheAccount = useCallback(async (next: Account | null) => {
    setAccountState(next);
    try {
      if (next) await setItem(ACCOUNT_KEY, JSON.stringify(next));
      else await removeItem(ACCOUNT_KEY);
    } catch {
      // The cache is a convenience only.
    }
  }, []);

  const clearSession = useCallback(async () => {
    await clearToken();
    setToken(null);
    await cacheAccount(null);
  }, [cacheAccount]);

  // Read the saved session, show it straight away, then confirm it with the server.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const stored = await getToken();
        if (!stored || !active) return;
        setToken(stored);

        const cached = await getItem(ACCOUNT_KEY);
        if (cached && active) setAccountState(JSON.parse(cached) as Account);
        if (active) setLoading(false);

        if (config.hasBackend) {
          const { user } = await fetchMe();
          if (active) await cacheAccount(user);
        }
      } catch {
        // Offline or a bad cache: keep whatever we have. A real 401 signs out via the handler below.
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [cacheAccount]);

  // A 401 on a signed-in request means the token expired or was revoked.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      void clearSession();
    });
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  const completeSignIn = useCallback(
    async (result: SignedIn) => {
      await saveToken(result.access_token);
      setToken(result.access_token);
      await cacheAccount(result.user);
      // The server is the source of truth once someone has an account; this also
      // lets a returning user skip onboarding on a new phone.
      await finishOnboarding({
        name: result.user.name,
        age: result.user.age,
        need: result.user.need as HelpTopic | null,
      });
    },
    [cacheAccount, finishOnboarding],
  );

  const setAccount = useCallback(
    (next: Account) => {
      void cacheAccount(next);
    },
    [cacheAccount],
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // Offline or already expired: signing out here is what matters.
    }
    await clearSession();
  }, [clearSession]);

  const value = useMemo<AuthState>(
    () => ({ token, account, signedIn: token !== null, loading, completeSignIn, setAccount, logout, clearSession }),
    [token, account, loading, completeSignIn, setAccount, logout, clearSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>.");
  return context;
}
