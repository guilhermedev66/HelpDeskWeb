import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AuthenticatedUserResponse } from '../../types/api';
import { fetchCurrentUser, login as loginRequest } from './api';
import { clearSession, readSession, saveSession } from '../../lib/tokenStorage';
import { onUnauthorized } from '../../lib/authEvents';
import { ApiError } from '../../lib/httpClient';

/**
 * 'error' = havia token salvo, mas não deu pra confirmá-lo (rede fora ou 5xx) —
 * diferente de 'unauthenticated', que é "sem sessão" ou "token confirmadamente inválido".
 * O token continua salvo em 'error': só um 401 real limpa a sessão.
 */
type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

interface AuthContextValue {
  status: AuthStatus;
  user: AuthenticatedUserResponse | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  retry: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(() => (readSession() ? 'loading' : 'unauthenticated'));
  const [user, setUser] = useState<AuthenticatedUserResponse | null>(null);

  const verifySession = useCallback(async () => {
    try {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
      setStatus('authenticated');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearSession();
        setUser(null);
        setStatus('unauthenticated');
        return;
      }
      // Rede fora ou 5xx: mantém o token, não derruba a sessão por um problema transitório.
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    if (!readSession()) return;
    // verifySession só muda o estado depois do await; não é uma escrita síncrona no efeito.
    // eslint-disable-next-line react/set-state-in-effect
    void verifySession();
  }, [verifySession]);

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

  const retry = useCallback(() => {
    if (!readSession()) {
      setStatus('unauthenticated');
      return;
    }
    setStatus('loading');
    void verifySession();
  }, [verifySession]);

  const value = useMemo(() => ({ status, user, login, logout, retry }), [status, user, login, logout, retry]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
