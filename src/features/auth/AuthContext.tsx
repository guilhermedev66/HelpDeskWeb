import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AuthenticatedUserResponse } from '../../types/api';
import { fetchCurrentUser, login as loginRequest } from './api';
import { clearSession, readSession, saveSession } from '../../lib/tokenStorage';
import { onUnauthorized } from '../../lib/authEvents';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  status: AuthStatus;
  user: AuthenticatedUserResponse | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(() => (readSession() ? 'loading' : 'unauthenticated'));
  const [user, setUser] = useState<AuthenticatedUserResponse | null>(null);

  useEffect(() => {
    if (!readSession()) return;

    let cancelled = false;
    fetchCurrentUser()
      .then((currentUser) => {
        if (cancelled) return;
        setUser(currentUser);
        setStatus('authenticated');
      })
      .catch(() => {
        if (cancelled) return;
        clearSession();
        setUser(null);
        setStatus('unauthenticated');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(
    () =>
      onUnauthorized(() => {
        setUser(null);
        setStatus('unauthenticated');
      }),
    [],
  );

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginRequest({ email, password });
    saveSession({ accessToken: response.accessToken, expiresAt: response.expiresAt });
    setUser(response.user);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const value = useMemo(() => ({ status, user, login, logout }), [status, user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
