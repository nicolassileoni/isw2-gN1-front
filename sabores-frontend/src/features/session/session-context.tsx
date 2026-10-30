import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { LoginResponse, Rol } from '@/lib/api/types';

/**
 * Sesión del personal.
 *
 * El backend actual **no emite token**: el login devuelve los datos del usuario y
 * nada más. Por eso la sesión vive solo en memoria, no se envía `Authorization`
 * y no se persiste la contraseña en ningún lado. Al reiniciar la app se pierde.
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
  const [user, setUser] = useState<Sesion | null>(null);

  const login = useCallback((sesion: Sesion) => setUser(sesion), []);
  const logout = useCallback(() => setUser(null), []);

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
