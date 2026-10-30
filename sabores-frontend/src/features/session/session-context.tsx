import { useRouter } from 'expo-router';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { LoginResponse, Rol } from '@/lib/api/types';
import {
  clearAuthToken,
  setAuthToken,
  subscribeToUnauthorized,
} from '@/lib/auth/token-store';

/**
 * Sesión del personal.
 *
 * La sesión vive en memoria. Cuando el backend devuelve un token, se guarda en
 * el token store para que el cliente HTTP lo envíe en `Authorization`. Al
 * reiniciar la app la sesión se pierde y hay que volver a ingresar.
 */
export type Sesion = LoginResponse;

type SessionContextValue = {
  user: Sesion | null;
  rol: Rol | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (sesion: Sesion) => void;
  logout: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<Sesion | null>(null);

  const login = useCallback((sesion: Sesion) => {
    setAuthToken(sesion.token);
    setUser(sesion);
  }, []);

  const logout = useCallback(() => {
    clearAuthToken();
    setUser(null);
  }, []);

  useEffect(
    () =>
      subscribeToUnauthorized(() => {
        setUser(null);
        clearAuthToken();
        router.replace('/(tabs)/personal');
      }),
    [router],
  );

  const value = useMemo<SessionContextValue>(
    () => ({
      user,
      rol: user?.rol ?? null,
      isAuthenticated: user !== null,
      isAdmin: user?.rol === 'ADMIN',
      login,
      logout,
    }),
    [user, login, logout],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useSession debe usarse dentro de <SessionProvider>.');
  }

  return context;
}
