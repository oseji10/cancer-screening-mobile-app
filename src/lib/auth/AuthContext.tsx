import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { login as loginRequest } from "../api/auth";
import { setUnauthorizedHandler } from "../api/client";
import { clearToken, getToken, saveToken } from "./tokenStorage";

type AuthState = {
  token: string | null;
  /** True until the stored token (if any) has been read on app start. */
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getToken()
      .then((stored) => {
        if (active) setToken(stored);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const logout = useCallback(async () => {
    await clearToken();
    setToken(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const received = await loginRequest(email, password);
    await saveToken(received);
    setToken(received);
  }, []);

  // A 401 from any request means the JWT expired or was revoked.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      void logout();
    });
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const value = useMemo(() => ({ token, loading, login, logout }), [token, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>.");
  return context;
}
